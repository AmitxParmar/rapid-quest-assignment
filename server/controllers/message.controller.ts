// controllers/messageController.ts
import { Request, Response } from "express";
import app from "../app";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";
import { Contact } from "../models/Contact";
import mongoose from "mongoose";

/**
 * Get all conversations for WhatsApp-like list.
 *
 * @route GET /api/conversations
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @description
 *   Fetches all non-archived conversations, sorted by the latest message timestamp.
 *   Responds with an array of conversation objects.
 */
export const getConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
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

/**
 * Get all messages for a specific conversation.
 *
 * @route GET /api/messages/:conversationId
 * @param {Request} req - Express request object (expects conversationId in params, page/limit in query)
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @description
 *   Fetches paginated messages for a given conversation.
 *   Returns messages and pagination info.
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
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
      .sort({ timestamp: -1 }) // Oldest first for chat display
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

/**
 * Send a new message.
 *
 * @route POST /api/messages
 * @param {Request} req - Express request object (expects from, to, text, type, direction in body)
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @description
 *   Validates input, finds or creates a conversation, creates a new message,
 *   updates the conversation's last message, emits a socket event, and responds with the new message.
 */
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

    // Emit socket event to notify clients that a message was created and saved
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const io = (app as any).io as import("socket.io").Server | undefined;
    if (io) {
      const conversationId =
        typeof conversation._id === "string"
          ? conversation._id
          : conversation._id && typeof conversation._id.toString === "function"
          ? conversation._id.toString()
          : "";

      const payload = {
        message: newMessage,
        conversationId,
      };

      // Emit to room for this conversation and as a global fallback
      if (conversationId) {
        io.to(conversationId).emit("message:created", payload);
      }
      io.emit("message:created", payload);
    }

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

/**
 * Get contact details.
 *
 * @route GET /api/contacts
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @description
 *   Fetches all contacts, selecting only relevant fields, and returns them sorted by name.
 */
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
