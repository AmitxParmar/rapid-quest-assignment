export type Participant = {
  waId: string;
  name: string;
  profilePicture?: string;
};

export type LastMessage = {
  text: string;
  timestamp: number;
  from: string;
  status: "sent" | "delivered" | "read" | "failed";
};

export type Conversation = {
  _id: string;
  conversationId: string;
  participants: Participant[];
  lastMessage: LastMessage;
  unreadCount: number;
  isArchived: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type Message = {
  _id: string;
  conversationId: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  status: "sent" | "delivered" | "read" | "failed";
  type: "text" | "image" | "document" | "audio" | "video";
  waId: string;
  direction: "incoming" | "outgoing";
  contact: {
    name: string;
    waId: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
};
