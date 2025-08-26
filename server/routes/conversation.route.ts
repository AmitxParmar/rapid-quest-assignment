import express from "express";
import {
  getContacts,
  getConversations,
  markAsRead,
} from "../controllers/conversation.controller";

const router = express.Router();

// GET /api/conversations - Get all conversations (WhatsApp-like list)
router.get("/:userId", getConversations);
router.get("/contacts", getContacts);

// PUT /api/conversations/:conversationId/read - Mark messages as read
router.put("/:conversationId/read", markAsRead);

export default router;
