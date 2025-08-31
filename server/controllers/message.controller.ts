import { Request, Response } from "express";
import app from "../app";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";
import { User, IUser } from "../models/User";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: IUser;
}



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
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

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

    // Verify user has access to this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.waId": req.user.waId
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this conversation",
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
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { to, text, type = "text", direction = "outgoing" } = req.body;
    const from = req.user.waId; // Use authenticated user's waId

    // Validate required fields
    if (!to || !text) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: to, text",
      });
    }

    // Get sender and receiver user info
    const senderUser = req.user;
    const receiverUser = await User.findOne({ waId: to });

    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
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
            name: senderUser.name || `User ${from}`,
            profilePicture: senderUser.profilePicture,
          },
          {
            waId: to,
            name: receiverUser.name || `User ${to}`,
            profilePicture: receiverUser.profilePicture,
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
        name: senderUser.name || `User ${from}`,
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
        io.to(conversationId).emit("conversation:updated", conversation);
      }
      io.emit("message:created", payload);
      io.emit("conversation:updated", conversation);
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
 * Update message delivery status.
 *
 * @route PUT /api/messages/:messageId/status
 * @param {Request} req - Express request object (expects messageId in params, status in body)
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @description
 *   Updates the status of a specific message (sent -> delivered -> read).
 *   Emits socket events to notify clients about the status change.
 */
export const updateMessageStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { messageId } = req.params;
    const { status } = req.body;

    // Validate required fields
    if (!messageId || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: messageId, status",
      });
    }

    // Validate status values
    const validStatuses = ["sent", "delivered", "read"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: sent, delivered, read",
      });
    }

    // Validate messageId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    // Update the message status
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    ).populate("conversationId");

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Emit socket event to notify clients about the status update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const io = (app as any).io as import("socket.io").Server | undefined;
    if (io) {
      const conversationId = updatedMessage.conversationId?.toString() || "";

      if (conversationId) {
        io.to(conversationId).emit("message:status-updated", {
          messageId: updatedMessage._id,
          conversationId,
          status: updatedMessage.status,
          message: updatedMessage,
        });
      }

      // Also emit globally for cross-device sync
      io.emit("message:status-updated", {
        messageId: updatedMessage._id,
        conversationId,
        status: updatedMessage.status,
        message: updatedMessage,
      });

      console.log(
        `[updateMessageStatus] Emitted status update: ${messageId} -> ${status}`
      );
    }

    res.status(200).json({
      success: true,
      data: {
        message: updatedMessage,
        status: updatedMessage.status,
      },
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update message status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
