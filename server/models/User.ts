import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  waId: string;
  name?: string;
  profilePicture?: string;
  status?: string;
  lastSeen?: Date;
  isOnline: boolean;
  password: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    waId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    status: {
      type: String,
      default: "Hey there! I am using WhaatsApp.",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Pre-save middleware to hash password and ensure waId has country code
userSchema.pre("save", async function (next) {
  // Hash password if it's modified
  if (this.isModified("password")) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  // Ensure waId has country code
  if (this.isModified("waId") && !this.waId.startsWith("91")) {
    this.waId = "91" + this.waId;
  }

  next();
});

export const User = mongoose.model<IUser>("User", userSchema);
