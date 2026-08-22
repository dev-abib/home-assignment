import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User";
import { Conversation } from "./models/Conversation";
import { Message } from "./models/Message";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanDatabase() {
  if (!MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI environment variable is not set in backend/.env");
    process.exit(1);
  }

  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log(" Connected to MongoDB.");

    console.log("🧹 Purging messages, conversations, and users...");
    const deletedMessages = await Message.deleteMany({});
    const deletedConversations = await Conversation.deleteMany({});
    const deletedUsers = await User.deleteMany({});

    console.log(`✅ Database cleaned successfully:`);
    console.log(`   - Deleted Messages: ${deletedMessages.deletedCount}`);
    console.log(`   - Deleted Conversations: ${deletedConversations.deletedCount}`);
    console.log(`   - Deleted Users: ${deletedUsers.deletedCount}`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Database cleanup failed:", err.message);
    process.exit(1);
  }
}

cleanDatabase();
