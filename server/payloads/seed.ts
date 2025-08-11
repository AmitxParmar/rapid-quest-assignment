// scripts/directSeed.ts
import mongoose from "mongoose";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";
import { Contact } from "../models/Contact";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const BUSINESS_PHONE = "918329446654";

async function createDirectData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected");

    // Clear existing data
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    await Contact.deleteMany({});
    console.log("✓ Cleared existing data");

    // Create contacts
    const raviContact = await Contact.create({
      waId: "919937320320",
      name: "Ravi Kumar",
      isOnline: false,
    });

    const nehaContact = await Contact.create({
      waId: "929967673820",
      name: "Neha Joshi",
      isOnline: false,
    });

    console.log("✓ Created contacts");

    // Conversation 1: Ravi Kumar
    const conv1Id = "conv_918329446654_919937320320";

    // Ravi's incoming message
    await Message.create({
      messageId: "wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=",
      conversationId: conv1Id,
      from: "919937320320",
      to: BUSINESS_PHONE,
      text: "Hi, I'd like to know more about your services.",
      timestamp: 1754400000,
      type: "text",
      waId: "919937320320",
      direction: "incoming",
      contact: {
        name: "Ravi Kumar",
        waId: "919937320320",
      },
      status: "delivered",
    });

    // Business reply to Ravi
    await Message.create({
      messageId:
        "wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggNDc4NzZBQ0YxMjdCQ0VFOTk2NzA3MTI4RkZCNjYyMjc=",
      conversationId: conv1Id,
      from: BUSINESS_PHONE,
      to: "919937320320",
      text: "Hi Ravi! Sure, I'd be happy to help you with that. Could you tell me what you're looking for?",
      timestamp: 1754400020,
      type: "text",
      waId: "919937320320",
      direction: "outgoing",
      contact: {
        name: "Ravi Kumar",
        waId: "919937320320",
      },
      status: "read",
    });

    // Conversation 2: Neha Joshi
    const conv2Id = "conv_918329446654_929967673820";

    // Neha's incoming message
    await Message.create({
      messageId:
        "wamid.HBgMOTI5OTY3NjczODIwFQIAEhggQ0FBQkNERUYwMDFGRjEyMzQ1NkZGQTk5RTJCM0I2NzY=",
      conversationId: conv2Id,
      from: "929967673820",
      to: BUSINESS_PHONE,
      text: "Hi, I saw your ad. Can you share more details?",
      timestamp: 1754401000,
      type: "text",
      waId: "929967673820",
      direction: "incoming",
      contact: {
        name: "Neha Joshi",
        waId: "929967673820",
      },
      status: "delivered",
    });

    // Business reply to Neha
    await Message.create({
      messageId:
        "wamid.HBgMOTI5OTY3NjczODIwFQIAEhggM0RFNDkxRjEwNDhDQzgwMzk3NzA1ODc1RkU3QzI0MzU=",
      conversationId: conv2Id,
      from: BUSINESS_PHONE,
      to: "929967673820",
      text: "Hi Neha! Absolutely. We offer curated home decor pieces—are you looking for nameplates, wall art, or something else?",
      timestamp: 1754401030,
      type: "text",
      waId: "929967673820",
      direction: "outgoing",
      contact: {
        name: "Neha Joshi",
        waId: "929967673820",
      },
      status: "delivered",
    });

    console.log("✓ Created messages");

    // Create conversations
    await Conversation.create({
      conversationId: conv1Id,
      participants: [
        { waId: "919937320320", name: "Ravi Kumar" },
        { waId: BUSINESS_PHONE, name: "Business" },
      ],
      lastMessage: {
        text: "Hi Ravi! Sure, I'd be happy to help you with that. Could you tell me what you're looking for?",
        timestamp: 1754400020,
        from: BUSINESS_PHONE,
        status: "read",
      },
      unreadCount: 0,
    });

    await Conversation.create({
      conversationId: conv2Id,
      participants: [
        { waId: "929967673820", name: "Neha Joshi" },
        { waId: BUSINESS_PHONE, name: "Business" },
      ],
      lastMessage: {
        text: "Hi Neha! Absolutely. We offer curated home decor pieces—are you looking for nameplates, wall art, or something else?",
        timestamp: 1754401030,
        from: BUSINESS_PHONE,
        status: "delivered",
      },
      unreadCount: 0,
    });

    console.log("✓ Created conversations");
    console.log("\n🎉 Database seeded with exact data from your JSON files!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed
createDirectData();
