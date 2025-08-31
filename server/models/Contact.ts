import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId; // Reference to User model
  contactUserId: mongoose.Types.ObjectId; // Reference to the contact's User record
  nickname?: string; // Optional custom name for this contact
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    contactUserId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    nickname: { type: String },
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate contacts
ContactSchema.index({ userId: 1, contactUserId: 1 }, { unique: true });

export const Contact = mongoose.model<IContact>("Contact", ContactSchema);
