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
      console.log("[markAsRead] Invalid conversationId:", conversationId);
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // Update all unread messages in the conversation to 'read'
    const updateResult = await Message.updateMany(
      {
        conversationId,
        to: waId,
        status: { $in: ["sent", "delivered"] },
      },
      {
        status: "read",
      }
    );
    console.log("[markAsRead] Message.updateMany result:", updateResult);

    // Find the conversation and get the lastMessage
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log("[markAsRead] Conversation not found:", conversationId);
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
    console.log(
      "[markAsRead] Conversation.lastMessage before update:",
      conversation.lastMessage
    );

    // Find the latest message in the conversation (in case lastMessage is stale)
    const lastMsg = await Message.findOne({ conversationId })
      .sort({ timestamp: -1 })
      .lean();

    let lastMessageUpdated = false;

    if (lastMsg) {
      // If the last message is to this user and its status is not "read", update lastMessage.status
      if (lastMsg.to === waId && lastMsg.status !== "read") {
        // Update lastMessage.status in the Conversation document
        const updateConvResult = await Conversation.findByIdAndUpdate(
          conversationId,
          {
            $set: {
              "lastMessage.status": "read",
              unreadCount: 0,
            },
          },
          { new: true }
        );
        lastMessageUpdated = true;
        console.log(
          "[markAsRead] Updated Conversation.lastMessage.status to 'read'. Update result:",
          updateConvResult?.lastMessage
        );
      } else {
        // Still reset unreadCount if not already done
        if (conversation.unreadCount !== 0) {
          const updateUnreadResult = await Conversation.findByIdAndUpdate(
            conversationId,
            {
              $set: { unreadCount: 0 },
            }
          );
          console.log(
            "[markAsRead] Reset unreadCount to 0. Update result:",
            updateUnreadResult?.unreadCount
          );
        }
        console.log(
          "[markAsRead] lastMsg.to !== waId or lastMsg.status already 'read'. No lastMessage.status update."
        );
      }
    } else {
      // No messages found for this conversation
      console.log(
        "[markAsRead] No messages found for conversation:",
        conversationId
      );
      // Still reset unreadCount if not already done
      if (conversation.unreadCount !== 0) {
        const updateUnreadResult = await Conversation.findByIdAndUpdate(
          conversationId,
          {
            $set: { unreadCount: 0 },
          }
        );
        console.log(
          "[markAsRead] Reset unreadCount to 0. Update result:",
          updateUnreadResult?.unreadCount
        );
      }
    }

    // --- Always update Conversation.lastMessage.status to "read" as requested ---
    // This ensures the field is updated regardless of the above logic
    const forceUpdateConv = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $set: {
          "lastMessage.status": "read",
        },
      },
      { new: true }
    );
    console.log(
      "[markAsRead] Forced Conversation.lastMessage.status to 'read'. Update result:",
      forceUpdateConv?.lastMessage
    );
    // --------------------------------------------------------------------------

    // Fetch the conversation again to see if lastMessage.status is updated
    const updatedConversation = await Conversation.findById(conversationId);
    console.log(
      "[markAsRead] Conversation.lastMessage after update:",
      updatedConversation?.lastMessage
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      lastMessageStatusUpdated: lastMessageUpdated,
      lastMessageBefore: conversation.lastMessage,
      lastMessageAfter: updatedConversation?.lastMessage,
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
