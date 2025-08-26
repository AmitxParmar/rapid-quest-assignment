import express from "express";
import {
  getMessages,
  sendMessage,
  updateMessageStatus,
} from "../controllers/message.controller";

const router = express.Router();

// GET /api/messages/:conversationId - Get messages for a specific conversation
router.get("/:conversationId", getMessages);

// POST /api/messages - Send a new message
router.post("/", sendMessage);

// PUT /api/messages/:messageId/status - Update message delivery status
router.put("/:messageId/status", updateMessageStatus);

export default router;
