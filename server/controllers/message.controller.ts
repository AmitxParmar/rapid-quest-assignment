// controllers/messageController.ts
import { Request, Response } from "express";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";
import { Contact } from "../models/Contact";
import mongoose from "mongoose";

// Get all conversations for WhatsApp-like list
export const getConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.find({ isArchived: false })
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

// Get all messages for a specific conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Debug: log incoming params and query
    console.log("[getMessages] conversationId:", conversationId);
    console.log("[getMessages] page:", page, "limit:", limit, "skip:", skip);

    // Validate conversationId
    if (!mongoose.Types.ObjectId.isValid(conversationId as string)) {
      console.error("[getMessages] Invalid conversation ID:", conversationId);
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // Debug: about to query messages
    console.log(
      "[getMessages] Querying messages for conversationId:",
      conversationId
    );

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 }) // Oldest first for chat display
      .skip(skip)
      .limit(limit)
      .lean();

    // Debug: messages found
    console.log(`[getMessages] Found ${messages.length} messages`);

    const totalMessages = await Message.countDocuments({ conversationId });

    // Debug: total messages count
    console.log(
      `[getMessages] Total messages in conversation: ${totalMessages}`
    );

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasMore: skip + messages.length < totalMessages,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Send a new message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { from, to, text, type = "text", direction = "outgoing" } = req.body;

    // Validate required fields
    if (!from || !to || !text) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: from, to, text",
      });
    }

    // Get sender and receiver contact info
    const senderContact = await Contact.findOne({ waId: from });
    const receiverContact = await Contact.findOne({ waId: to });

    if (!senderContact || !receiverContact) {
      return res.status(404).json({
        success: false,
        message: "Sender or receiver contact not found",
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      $or: [
        {
          "participants.waId": { $all: [from, to] },
          participants: { $size: 2 },
        },
      ],
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        conversationId: `${from}_${to}_${Date.now()}`,
        participants: [
          {
            waId: from,
            name: senderContact.name,
            profilePicture: senderContact.profilePicture,
          },
          {
            waId: to,
            name: receiverContact.name,
            profilePicture: receiverContact.profilePicture,
          },
        ],
        lastMessage: {
          text,
          timestamp: Date.now(),
          from,
          status: "sent",
        },
        unreadCount: 1,
      });

      await conversation.save();
    }

    // Create new message
    const newMessage = new Message({
      conversationId: conversation._id,
      from,
      to,
      text,
      timestamp: Date.now(),
      status: "sent",
      type,
      waId: from,
      direction,
      contact: {
        name: senderContact.name,
        waId: from,
      },
    });

    await newMessage.save();

    // Update conversation's last message
    conversation.lastMessage = {
      text,
      timestamp: newMessage.timestamp,
      from,
      status: "sent",
    };
    conversation.unreadCount += 1;
    await conversation.save();

    res.status(201).json({
      success: true,
      data: {
        message: newMessage,
        conversationId: conversation._id,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get contact details
export const getContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.find({})
      .select("waId name profilePicture isOnline lastSeen")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
