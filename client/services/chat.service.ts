import { api } from "@/lib/api";

// Fetch messages for a conversation or user
export async function getMessages(conversationId: string) {
  const res = await api.get(`/api/messages/${conversationId}`);
  return res.data.data;
}

// Send a message in a conversation
export async function sendMessage(data: {
  conversationId: string;
  content: string;
}) {
  const res = await api.post("/api/messages/send", data);
  return res.data.data;
}

// Fetch contacts for the current user
export async function getContacts() {
  const res = await api.get("/api/contacts");
  return res.data.data;
}
