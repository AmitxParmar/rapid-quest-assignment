// scripts/dropIndex.ts
import mongoose from "mongoose";
import { Message } from "../models/Message"; // Adjust path to your Message model

const dropMessageIdIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("your-mongodb-connection-string"); // Replace with your connection string

    console.log("Connected to MongoDB...");

    // Drop the specific index
    await Message.collection.dropIndex("messageId_1");

    console.log("Successfully dropped messageId_1 index!");

    // Optional: Check remaining indexes
    const indexes = await Message.collection.indexes();
    console.log("Remaining indexes:", indexes);
  } catch (error) {
    if (error.code === 27) {
      console.log("Index messageId_1 does not exist (already dropped)");
    } else {
      console.error("Error dropping index:", error);
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the scrip
dropMessageIdIndex();
