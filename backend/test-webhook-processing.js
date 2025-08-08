import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import {
  processWebhookPayload,
  createOutgoingMessage,
  getConversationMessages,
} from "../utils/webhookProcessor.js";
import {
  WebhookPayload,
  User,
  Message,
  Conversation,
  MessageStatus,
} from "../models/index.js";

// Sample test function to process your webhook payloads
async function testWebhookProcessing() {
  try {
    // Connect to MongoDB (you'll need to update with your connection string)
    await mongoose.connect("mongodb://localhost:27017/whatsapp-clone", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Load and process sample payloads
    const samplePayloadsDir = path.join(
      process.cwd(),
      "../whatsapp sample payloads"
    );
    const payloadFiles = fs.readdirSync(samplePayloadsDir);

    for (const file of payloadFiles) {
      if (file.endsWith(".json")) {
        console.log(`\nProcessing ${file}...`);

        const filePath = path.join(samplePayloadsDir, file);
        const payloadData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        try {
          const result = await processWebhookPayload(payloadData);
          console.log(`✅ Successfully processed ${file}:`, {
            webhookId: result.webhookId,
            processedCount: result.processed.length,
            errorCount: result.errors.length,
          });

          if (result.errors.length > 0) {
            console.log("⚠️ Errors:", result.errors);
          }
        } catch (error) {
          console.error(`❌ Error processing ${file}:`, error.message);
        }
      }
    }

    // Test creating an outgoing message
    console.log("\n--- Testing outgoing message creation ---");
    const users = await User.find().limit(2);
    if (users.length >= 2) {
      const outgoingMessage = await createOutgoingMessage(
        users[0]._id,
        users[1].wa_id || users[1].phone_number,
        "This is a test outgoing message",
        "text"
      );
      console.log("✅ Created outgoing message:", outgoingMessage._id);
    }

    // Test getting conversation messages
    console.log("\n--- Testing conversation messages retrieval ---");
    const conversation = await Conversation.findOne().populate("participants");
    if (conversation) {
      const messages = await getConversationMessages(conversation._id, 10);
      console.log(
        `✅ Retrieved ${messages.length} messages for conversation ${conversation._id}`
      );
    }

    // Display some statistics
    console.log("\n--- Database Statistics ---");
    const stats = {
      users: await User.countDocuments(),
      messages: await Message.countDocuments(),
      conversations: await Conversation.countDocuments(),
      webhookPayloads: await WebhookPayload.countDocuments(),
      messageStatuses: await MessageStatus.countDocuments(),
    };

    console.log("📊 Database Statistics:", stats);

    // Close connection
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWebhookProcessing();
}

export default testWebhookProcessing;
