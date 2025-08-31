import {
  getContacts,
  addContact,
  searchUsers,
} from "../controllers/contacts.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

// All contact routes require authentication
router.get("/", authenticateToken, getContacts);
router.get("/search", authenticateToken, searchUsers);
router.post("/", authenticateToken, addContact);

export default router;
