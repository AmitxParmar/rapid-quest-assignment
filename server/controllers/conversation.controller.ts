import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import mongoose from "mongoose";
import { Message } from "../models/Message";

// Get all conversations for WhatsApp-like list
export const getConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params; // Get userId from URL params
    // Alternative: const { userId } = req.query; // Get userId from query params

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const conversations = await Conversation.find({
      isArchived: false,
      "participants.waId": userId, // Filter conversations where user is a participant
    })
      .sort({ "lastMessage.timestamp": -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Mark messages as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { waId } = req.body; // The user marking messages as read

    if (!mongoose.Types.ObjectId.isValid(conversationId as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // Update all unread messages in the conversation to 'read'
    await Message.updateMany(
      {
        conversationId,
        to: waId,
        status: { $in: ["sent", "delivered"] },
      },
      {
        status: "read",
      }
    );

    // Reset unread count for the conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      unreadCount: 0,
    });

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
