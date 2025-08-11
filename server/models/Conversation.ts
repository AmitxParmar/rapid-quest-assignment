import mongoose, { type Document, Schema } from "mongoose";

// Remove the unique constraint from conversationId to avoid duplicate index warning
export interface IConversation extends Document {
  conversationId: string;
  participants: {
    waId: string;
    name: string;
    profilePicture?: string;
  }[];
  lastMessage: {
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
    conversationId: { type: String, required: true }, // removed unique: true
    participants: [
      {
        waId: { type: String, required: true },
        name: { type: String, required: true },
        profilePicture: { type: String },
      },
    ],
    lastMessage: {
      text: { type: String, required: true },
      timestamp: { type: Number, required: true },
      from: { type: String, required: true },
      status: { type: String, required: true },
    },
    unreadCount: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Only define the index via schema.index(), not via unique: true above
ConversationSchema.index({ conversationId: 1 });
ConversationSchema.index({ "lastMessage.timestamp": -1 });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);
