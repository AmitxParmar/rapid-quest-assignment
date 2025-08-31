import mongoose from "mongoose";
import { User } from "../models/User";
import { Contact } from "../models/Contact";
import { env } from "../config/env";

// Old Contact interface for migration
interface OldContact {
  _id: mongoose.Types.ObjectId;
  waId: string;
  name: string;
  profilePicture?: string;
  lastSeen?: Date;
  isOnline: boolean;
}

async function migrateContacts() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB");

    // Get all old contacts
    const oldContacts = await mongoose.connection.db
      .collection("contacts")
      .find({})
      .toArray() as OldContact[];

    console.log(`Found ${oldContacts.length} old contacts to migrate`);

    for (const oldContact of oldContacts) {
      // Create or find user for this contact
      let user = await User.findOne({ waId: oldContact.waId });
      
      if (!user) {
        user = new User({
          waId: oldContact.waId,
          name: oldContact.name,
          profilePicture: oldContact.profilePicture,
          isOnline: oldContact.isOnline,
          lastSeen: oldContact.lastSeen,
        });
        await user.save();
        console.log(`Created user for waId: ${oldContact.waId}`);
      } else {
        console.log(`User already exists for waId: ${oldContact.waId}`);
      }
    }

    // Clear old contacts collection (optional - uncomment if you want to remove old data)
    // await mongoose.connection.db.collection("contacts").deleteMany({});
    // console.log("Cleared old contacts collection");

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateContacts();
}

export { migrateContacts };