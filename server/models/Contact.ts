import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  waId: string;
  name: string;
  profilePicture?: string;
  lastSeen?: Date;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    waId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    profilePicture: { type: String },
    lastSeen: { type: Date },
    isOnline: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

ContactSchema.index({ waId: 1 });

export const Contact = mongoose.model<IContact>("Contact", ContactSchema);
