/**
 * Complete WhatsApp Model Usage Example
 * This file demonstrates how to use all the updated models with real WhatsApp webhook data
 */

import {
  processWebhookPayload,
  createOutgoingMessage,
  getConversationMessages,
} from "./utils/webhookProcessor.js";
import {
  User,
  Message,
  Conversation,
  WebhookPayload,
  MessageStatus,
} from "./models/index.js";

// Example 1: Processing an incoming message webhook
export const exampleIncomingMessage = async () => {
  console.log("Example 1: Processing incoming WhatsApp message");

  // Sample webhook payload (similar to your sample files)
  const webhookPayload = {
    _id: "example-msg-001",
    payload_type: "whatsapp_webhook",
    metaData: {
      entry: [
        {
          changes: [
            {
              field: "messages",
              value: {
                contacts: [
                  {
                    profile: {
                      name: "John Doe",
                    },
                    wa_id: "1234567890",
                  },
                ],
                messages: [
                  {
                    from: "1234567890",
                    id: "wamid.example123",
                    timestamp: "1693123200",
                    text: {
                      body: "Hello, I need help with my order",
                    },
                    type: "text",
                  },
                ],
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "919876543210",
                  phone_number_id: "phone123",
                },
              },
            },
          ],
          id: "entry123",
        },
      ],
      gs_app_id: "app123",
      object: "whatsapp_business_account",
    },
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    executed: true,
  };

  try {
    const result = await processWebhookPayload(webhookPayload);
    console.log("✅ Processed webhook:", result);
    return result;
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    throw error;
  }
};

// Example 2: Processing a status update webhook
export const exampleStatusUpdate = async () => {
  console.log("Example 2: Processing status update");

  const statusWebhook = {
    _id: "example-status-001",
    payload_type: "whatsapp_webhook",
    metaData: {
      entry: [
        {
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "919876543210",
                  phone_number_id: "phone123",
                },
                statuses: [
                  {
                    id: "wamid.example123",
                    status: "delivered",
                    timestamp: "1693123260",
                    recipient_id: "1234567890",
                    conversation: {
                      id: "conv123",
                      origin: {
                        type: "user_initiated",
                      },
                    },
                    pricing: {
                      billable: true,
                      category: "utility",
                      pricing_model: "CBP",
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    executed: true,
  };

  try {
    const result = await processWebhookPayload(statusWebhook);
    console.log("✅ Processed status update:", result);
    return result;
  } catch (error) {
    console.error("❌ Error processing status:", error);
    throw error;
  }
};

// Example 3: Creating an outgoing message
export const exampleOutgoingMessage = async () => {
  console.log("Example 3: Creating outgoing message");

  try {
    // First, get a user (in real app, you'd have the logged-in user's ID)
    const businessUser = await User.findOne({
      display_phone_number: "919876543210",
    });
    if (!businessUser) {
      throw new Error(
        "Business user not found. Run incoming message example first."
      );
    }

    const message = await createOutgoingMessage(
      businessUser._id,
      "1234567890",
      "Thank you for contacting us! How can we help you today?",
      "text"
    );

    console.log("✅ Created outgoing message:", {
      id: message._id,
      content: message.content,
      type: message.type,
      to: message.to_phone,
    });

    return message;
  } catch (error) {
    console.error("❌ Error creating message:", error);
    throw error;
  }
};

// Example 4: Retrieving conversation messages
export const exampleGetMessages = async () => {
  console.log("Example 4: Retrieving conversation messages");

  try {
    // Find a conversation
    const conversation = await Conversation.findOne().populate("participants");
    if (!conversation) {
      throw new Error("No conversations found. Run other examples first.");
    }

    const messages = await getConversationMessages(conversation._id, 10, 0);

    console.log(`✅ Retrieved ${messages.length} messages from conversation:`, {
      conversationId: conversation._id,
      participants: conversation.participants.length,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        type: m.type,
        timestamp: m.timestamp,
      })),
    });

    return messages;
  } catch (error) {
    console.error("❌ Error retrieving messages:", error);
    throw error;
  }
};

// Example 5: Querying models directly
export const exampleDirectQueries = async () => {
  console.log("Example 5: Direct model queries");

  try {
    // Get all users with WhatsApp IDs
    const whatsappUsers = await User.find({
      wa_id: { $exists: true, $ne: null },
    });
    console.log(`📱 Found ${whatsappUsers.length} WhatsApp users`);

    // Get messages by type
    const textMessages = await Message.find({ type: "text" }).limit(5);
    console.log(`💬 Found ${textMessages.length} text messages`);

    // Get latest message statuses
    const latestStatuses = await MessageStatus.find()
      .sort({ createdAt: -1 })
      .limit(3);
    console.log(`📊 Found ${latestStatuses.length} recent status updates`);

    // Get webhook payloads
    const webhookCount = await WebhookPayload.countDocuments();
    console.log(`📥 Processed ${webhookCount} webhook payloads`);

    // Get conversation statistics
    const conversations = await Conversation.find().populate("lastMessage");
    console.log(`💭 Found ${conversations.length} conversations`);

    return {
      users: whatsappUsers.length,
      textMessages: textMessages.length,
      statuses: latestStatuses.length,
      webhooks: webhookCount,
      conversations: conversations.length,
    };
  } catch (error) {
    console.error("❌ Error in direct queries:", error);
    throw error;
  }
};

// Run all examples
export const runAllExamples = async () => {
  console.log("🚀 Running WhatsApp Models Examples\n");

  try {
    // Note: In a real application, you'd have MongoDB connected
    console.log(
      "⚠️  Make sure MongoDB is connected before running these examples\n"
    );

    await exampleIncomingMessage();
    console.log("");

    await exampleStatusUpdate();
    console.log("");

    await exampleOutgoingMessage();
    console.log("");

    await exampleGetMessages();
    console.log("");

    const stats = await exampleDirectQueries();

    console.log("\n📊 Final Statistics:", stats);
    console.log("\n✅ All examples completed successfully!");
  } catch (error) {
    console.error("❌ Example failed:", error);
  }
};

// Export everything for use in other files
export default {
  exampleIncomingMessage,
  exampleStatusUpdate,
  exampleOutgoingMessage,
  exampleGetMessages,
  exampleDirectQueries,
  runAllExamples,
};
