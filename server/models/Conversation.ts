import mongoose, { type Document, Schema } from "mongoose";

export interface IConversation extends Document {
  conversationId: string;
  participants: {
    waId: string;
    name: string;
    profilePicture?: string;
  }[];
  lastMessage?: {
    text: string;
    timestamp: number;
    from: string;
    status: string;
  };
  unreadCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    conversationId: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toHexString(), // Auto-generate conversationId
    },
    participants: [
      {
        waId: { type: String, required: true },
        name: { type: String, required: true },
        profilePicture: { type: String },
      },
    ],
    lastMessage: {
      text: { type: String },
      timestamp: { type: Number },
      from: { type: String },
      status: { type: String },
    },
    unreadCount: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ conversationId: 1 });
ConversationSchema.index({ "lastMessage.timestamp": -1 });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);
