import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  mongoose.set("debug", true); // Enable debug mode

  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
