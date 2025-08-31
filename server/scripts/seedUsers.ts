import mongoose from "mongoose";
import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seedUsers() {
  try {
    console.log("Connecting to MongoDB...");
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables.");
    }
    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("✓ Cleared existing users");

    // Create users with the specified data
    const users = [
      {
        waId: "91123456789",
        name: "Business Account",
        password: "demo123", // Common password for both accounts
      },
      {
        waId: "919937320320",
        name: "Ravi Kumar",
        password: "demo123", // Common password for both accounts
      },
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push({
        waId: user.waId,
        name: user.name,
        id: user._id,
      });
      console.log(`✓ Created user: ${user.name} (${user.waId})`);
    }

    console.log("\n🎉 Users seeded successfully!");
    console.log("Created users:");
    createdUsers.forEach((user) => {
      console.log(`  - ${user.name}: ${user.waId} (ID: ${user.id})`);
    });
    console.log("\nLogin credentials for both accounts:");
    console.log("  Password: demo123");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  }
}

// Run the seed
seedUsers();
