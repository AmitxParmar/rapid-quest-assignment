import mongoose from "mongoose";
import app from "../app";
import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { Contact } from "../models/Contact";
import { User, IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}


/**
 * Get or create a conversation ID for two participants.
 *
 * @route POST /api/conversations
 * @param {Request} req - Express request object (expects from and to in body)
 * @param {Response} res - Express response object
 * @returns {Promise<Response>}
 * @description
 *   Finds existing conversation between two participants or creates a new one.
 *   Responds with conversation ID for navigation.
 */
export const getConversationId = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { to } = req.body;
    const from = req.user.waId; // Use authenticated user's waId

    // Validate required fields
    if (!to) {
      return res.status(400).json({
        success: false,
        message: "'to' field is required",
      });
    }

    // Validate field types
    if (typeof to !== "string") {
      return res.status(400).json({
        success: false,
        message: "'to' must be a string",
      });
    }

    // Trim and validate non-empty
    const fromId = from.trim();
    const toId = to.trim();

    if (!fromId || !toId) {
      return res.status(400).json({
        success: false,
        message: "Both 'from' and 'to' must be non-empty strings",
      });
    }

    // Validate they are different
    if (fromId === toId) {
      return res.status(400).json({
        success: false,
        message: "Cannot create conversation with the same participant",
      });
    }

    // Look for existing conversation between these two participants
    // Search regardless of participant order
    const existingConversation = await Conversation.findOne({
      $and: [
        { "participants.waId": fromId },
        { "participants.waId": toId },
        { participants: { $size: 2 } } // Ensure it's a 2-person conversation
      ]
    });

    if (existingConversation) {
      // Return existing conversation
      return res.status(200).json({
        success: true,
        data: {
          conversationId: existingConversation?.toString() || existingConversation.id ,
          isNew: false,
          participants: existingConversation.participants,
        },
      });
    }

    // No existing conversation found, need to create new one
    // Get participant details from User model
    const users = await User.find({
      waId: { $in: [fromId, toId] }
    });

    // Validate both users exist
    if (users.length !== 2) {
      const foundIds = users.map(u => u.waId);
      const missingIds = [fromId, toId].filter(id => !foundIds.includes(id));

      return res.status(404).json({
        success: false,
        message: `User(s) not found: ${missingIds.join(', ')}`,
      });
    }

    // Create new conversation
    const participants = users.map(user => ({
      waId: user.waId,
      name: user.name || `User ${user.waId}`,
      profilePicture: user.profilePicture,
    }));

    // Generate unique conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newConversation = new Conversation({
      conversationId,
      participants,
      lastMessage: {
        text: "",
        timestamp: Date.now(),
        from: fromId,
        status: "sent",
      },
      unreadCount: 0,
      isArchived: false,
    });

    const savedConversation = await newConversation.save();

    return res.status(201).json({
      success: true,
      data: {
        conversationId: savedConversation._id?.toString() || savedConversation.id,
        isNew: true,
        participants: savedConversation.participants,
      },
    });

  } catch (error) {
    console.error("Error in getConversationId:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process conversation ID request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all conversations for WhatsApp-like list for a specific user.
 *
 * @route GET /api/conversations/:userId
 * @param {Request} req - Express request object (expects userId in params)
 * @param {Response} res - Express response object
 * @returns {Promise<Response>}  // <-- Fixed return type
 * @description
 *   Fetches all non-archived conversations for the given user, sorted by the latest message timestamp.
 *   Responds with an array of conversation objects.
 */
export const getConversations = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const conversations = await Conversation.find({
      isArchived: false,
      "participants.waId": req.user.waId, // Filter conversations where authenticated user is a participant
      "lastMessage.timestamp": { $exists: true, $ne: null }, // Only include conversations with at least one message
    })
      .sort({ "lastMessage.timestamp": -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Mark all messages in a conversation as read for a specific user.
 *
 * @route POST /api/conversations/:conversationId/read
 * @param {Request} req - Express request object (expects conversationId in params, waId in body)
 * @param {Response} res - Express response object
 * @returns {Promise<Response>}
 * @description
 *   Updates all unread messages in the conversation (where to=waId and status is "sent" or "delivered") to "read".
 *   Also updates the conversation's lastMessage.status to "read" and resets unreadCount to 0.
 *   Responds with the status of the update and the lastMessage before and after the update.
 */
export const markAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { conversationId } = req.params;
    const waId = req.user.waId; // Use authenticated user's waId

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

    // Emit socket events to notify clients about the status update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const io = (app as any).io as import("socket.io").Server | undefined;
    if (io && updatedConversation) {
      const convId = updatedConversation._id?.toString() || "";

      // Emit conversation update to all clients
      io.emit("conversation:updated", updatedConversation);

      // Emit specific message status update event
      io.emit("messages:marked-as-read", {
        conversationId: convId,
        waId,
        updatedMessages: updateResult.modifiedCount,
        conversation: updatedConversation,
      });

      console.log(
        "[markAsRead] Emitted socket events for conversation:",
        convId
      );
    }

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      lastMessageStatusUpdated: lastMessageUpdated,
      lastMessageBefore: conversation.lastMessage,
      lastMessageAfter: updatedConversation?.lastMessage,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
