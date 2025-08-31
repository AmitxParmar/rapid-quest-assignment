import mongoose from "mongoose";
import { User } from "../models/User";
import { env } from "../config/env";

async function migrateUsersPassword() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB");

    // Find all users without passwords
    const usersWithoutPassword = await User.find({
      $or: [
        { password: { $exists: false } },
        { password: null },
        { password: "" },
      ],
    });

    console.log(`Found ${usersWithoutPassword.length} users without passwords`);

    if (usersWithoutPassword.length === 0) {
      console.log("No users need password migration");
      return;
    }

    // Default password for existing users (they should change this on first login)
    const defaultPassword = "changeme123";

    for (const user of usersWithoutPassword) {
      user.password = defaultPassword;
      await user.save();
      console.log(
        `Added default password for user: ${user.waId} (${user.name})`
      );
    }

    console.log("Password migration completed successfully");
    console.log(
      "⚠️  IMPORTANT: Users should change their default password 'changeme123' on first login"
    );
  } catch (error) {
    console.error("Password migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateUsersPassword();
}

export { migrateUsersPassword };
