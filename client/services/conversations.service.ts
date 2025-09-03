import api from "@/lib/api";
import { Conversation, User } from "@/types";

const API_BASE = "/api/conversations";

// Get all conversations
export async function fetchAllConversations(): Promise<Conversation[] | []> {
  const response = await api.get(API_BASE);
  return response.data.data || [];
}

type MarkRead = {
  success: true;
  message: string;
};

// Mark all messages as read in a conversation
export async function markMessagesAsRead(conversationId: string, waId: string) {
  const res = await api.put(`${API_BASE}/${conversationId}/read`, {
    waId,
  });
  return res.data as MarkRead;
}

// Get conversation by ID
export async function getConversationId(to: User["waId"]) {
  const res = await api.post(API_BASE, { to });
  console.log("getconvoid", res.data.data);
  return res.data.data;
}

// Delete conversation (soft delete by archiving or hard delete)
export async function deleteConversation(
  conversationId: string,
  deleteType: "soft" | "hard" = "soft"
) {
  const res = await api.delete(`${API_BASE}/${conversationId}`, {
    params: { deleteType },
  });
  return res.data;
}
