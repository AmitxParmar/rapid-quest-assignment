import { api } from "@/lib/api";
import { Message } from "@/types";

export interface IMessagePagination {
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  hasMore: boolean;
}

export interface IMessageResponse {
  messages: Message[];
  pagination: IMessagePagination;
}

export interface IAddMessageRequest {
  from: string;
  to: string;
  text: string;
  type?: string;
}

export interface IAddMessageResponse {
  message: Message;
  conversationId: string;
}

// Fetch messages by conversation ID
export async function getMessages(conversationId: string) {
  const res = await api.get(`/api/messages/${conversationId}`);
  return res.data.data as IMessageResponse;
}

// Add (send) a new message
export async function sendMessage(data: IAddMessageRequest) {
  const res = await api.post("/api/messages", data);
  return res.data.data as IAddMessageResponse;
}

// Fetch all contacts
export async function getContacts() {
  const res = await api.get("/api/contacts");
  return res.data.data;
}
