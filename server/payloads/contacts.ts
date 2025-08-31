import mongoose from "mongoose";

import { Contact } from "../models/Contact";
import dotenv from "dotenv";

dotenv.config();

async function createDirectData() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    console.log("Connecting to MongoDB...");
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables.");
    }
    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected");

    // Clear existing data

    const contacts = await Contact.find({});

    console.log("✓ Fetched Contacts", contacts);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed
createDirectData();
