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

    // Validate or resolve conversationId
    let resolvedConversationId: string = conversationId as string;
    if (!mongoose.Types.ObjectId.isValid(resolvedConversationId)) {
      // Fallback: allow client to pass Conversation.conversationId (string), resolve to _id
      const convByPublicId = await Conversation.findOne({
        conversationId: resolvedConversationId,
      })
        .select({ _id: 1 })
        .lean();
      if (!convByPublicId?._id) {
        console.error("[getMessages] Invalid conversation ID:", conversationId);
        return res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
      }
      resolvedConversationId = convByPublicId._id.toString();
      console.log(
        "[getMessages] Resolved public conversationId to _id:",
        resolvedConversationId
      );
    }

    // --- Check if user is a participant in the conversation ---
    const conversation = await Conversation.findById(
      new mongoose.Types.ObjectId(resolvedConversationId)
    ).lean();
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
    // Check if the user is a participant
    const normalizeWaId = (id: string) =>
      id?.startsWith("91") ? id.trim() : `91${id?.trim()}`;
    const currentWaId = normalizeWaId(req.user!.waId);
    const isParticipant = Array.isArray(conversation.participants)
      ? conversation.participants.some((p: any) => p?.waId === currentWaId)
      : false;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    // Debug: about to query messages
    console.log(
      "[getMessages] Querying messages for conversationId:",
      resolvedConversationId
    );

    // NOTE: The field in Message is likely "conversationId" (ObjectId), so make sure to query by ObjectId
    const messages = await Message.find({
      conversationId: new mongoose.Types.ObjectId(resolvedConversationId),
    })
      .sort({ timestamp: 1 }) // Ascending order: oldest first for chat display
      .skip(skip)
      .limit(limit)
      .lean();

    // Debug: messages found
    console.log(`[getMessages] Found ${messages.length} messages`);

    const totalMessages = await Message.countDocuments({
      conversationId: new mongoose.Types.ObjectId(resolvedConversationId),
    });

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

    const { to, text, type = "text" } = req.body;
    const from = req.user.waId; // Use authenticated user's waId

    const normalizeWaId = (id: string) =>
      id?.startsWith("91") ? id.trim() : `91${id?.trim()}`;

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

    const fromId = normalizeWaId(from);
    const toId = normalizeWaId(to);

    // Find or create conversation (aligned with getConversationId)
    let conversation = await Conversation.findOne({
      $and: [
        { "participants.waId": fromId },
        { "participants.waId": toId },
        { participants: { $size: 2 } },
      ],
    });

    console.log(
      `[sendMessage] lookup from=${fromId} to=${toId} existing=${conversation?._id}`
    );

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [
          {
            waId: fromId,
            name: senderUser.name || `User ${fromId}`,
            profilePicture: senderUser.profilePicture,
          },
          {
            waId: toId,
            name: receiverUser.name || `User ${toId}`,
            profilePicture: receiverUser.profilePicture,
          },
        ],
        lastMessage: {
          text,
          timestamp: Date.now(),
          from: fromId,
          status: "sent",
        },
        unreadCount: 1,
      });

      await conversation.save();
      console.log(
        `[sendMessage] created conversationId=${
          conversation._id
        } participants=${conversation.participants
          .map((p: any) => p.waId)
          .join(",")}`
      );
    }

    // Create new message
    const newMessage = new Message({
      conversationId: conversation._id,
      from: fromId,
      to: toId,
      text,
      timestamp: Date.now(),
      status: "sent",
      type,
      waId: fromId,

      contact: {
        name: senderUser.name || `User ${fromId}`,
        waId: fromId,
      },
    });

    await newMessage.save();

    // Update conversation's last message
    conversation.lastMessage = {
      text,
      timestamp: newMessage.timestamp,
      from: fromId,
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
