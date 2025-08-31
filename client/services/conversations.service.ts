import { api } from "@/lib/api";
import { Conversation } from "@/types";

// Get all conversations
export async function fetchAllConversations(): Promise<Conversation[] | []> {
  const response = await api.get(`/api/conversations`);
  return response.data.data || [];
}

type MarkRead = {
  success: true;
  message: string;
};

// Mark all messages as read in a conversation
export async function markMessagesAsRead(conversationId: string, waId: string) {
  const res = await api.put(`/api/conversations/${conversationId}/read`, {
    waId,
  });
  return res.data as MarkRead;
}

// Get conversation by ID
export async function getConversationId(participants: {
  from: string;
  to: string;
}) {
  const res = await api.post(`/api/conversations`, participants);
  return res.data.data;
}
