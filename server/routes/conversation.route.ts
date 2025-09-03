import express from "express";
import {
  getConversations,
  markAsRead,
  getConversationId,
  deleteConversation,
} from "../controllers/conversation.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// All conversation routes require authentication
router.post("/", authenticateToken, getConversationId);
router.get("/", authenticateToken, getConversations); // Changed from /:userId to / since we get user from auth
router.put("/:conversationId/read", authenticateToken, markAsRead);
router.delete("/:conversationId", authenticateToken, deleteConversation);

export default router;
