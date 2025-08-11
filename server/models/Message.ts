import mongoose, { type Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  conversationId: Types.ObjectId | string; // Reference to Conversation
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
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation", // Reference to Conversation model in other folder
      required: true,
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Number, required: true, default: Date.now() },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    type: {
      type: String,
      enum: ["text", "image", "document", "audio", "video"],
      default: "text",
    },

    waId: { type: String, required: true },
    direction: {
      type: String,
      enum: ["incoming", "outgoing"],
    },
    contact: {
      name: { type: String, required: true },
      waId: { type: String, required: true },
    },
  },
  {
    timestamps: true,
    collection: "processed_messages",
  }
);

// Index for efficient queries
MessageSchema.index({ conversationId: 1, timestamp: 1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
