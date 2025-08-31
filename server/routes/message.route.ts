import express from "express";
import {
  getMessages,
  sendMessage,
  updateMessageStatus,
} from "../controllers/message.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// All message routes require authentication
router.get("/:conversationId", authenticateToken, getMessages);
router.post("/", authenticateToken, sendMessage);
router.put("/:messageId/status", authenticateToken, updateMessageStatus);

export default router;
