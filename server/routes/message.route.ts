import express from "express";
import {
  getMessages,
  sendMessage,
  getContacts,
} from "../controllers/message.controller";

const router = express.Router();

// GET /api/messages/:conversationId - Get messages for a specific conversation
router.get("/:conversationId", getMessages);

// POST /api/messages - Send a new message
router.post("/", sendMessage);

// GET /api/contacts - Get all contacts
router.get("/contacts", getContacts);

export default router;
