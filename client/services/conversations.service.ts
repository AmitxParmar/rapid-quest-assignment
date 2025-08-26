import { api } from "@/lib/api";
import { Conversation } from "@/types";

// Get all conversations
export async function fetchAllConversations(
  userId: string
): Promise<Conversation[] | []> {
  const response = await api.get(`/api/conversations/${userId}`);
  return response.data.data || [];
}

type MarkRead = {
  successs: true;
  message: string;
};

// Mark all messages as read in a conversation
export async function markMessagesAsRead(conversationId: string, waId: string) {
  const res = await api.put(`/api/conversations/${conversationId}/read`, {
    waId,
  });
  return res.data as MarkRead;
}

// Fetch all contacts
export async function getContacts() {
  const res = await api.get("/api/conversations/contacts");
  return res.data.data;
}
