import mongoose from "mongoose";

const messageStatusSchema = new mongoose.Schema(
  {
    // Reference to the original message
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },

    // WhatsApp message ID
    whatsapp_message_id: {
      type: String,
      required: true,
    },

    // Status information
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      required: true,
    },

    // Timestamp of status update
    timestamp: {
      type: String,
      required: true,
    },

    // Recipient phone number
    recipient_id: {
      type: String,
      required: true,
    },

    // Conversation information from WhatsApp
    conversation: {
      id: String,
      origin: {
        type: {
          type: String,
          enum: ["user_initiated", "business_initiated", "referral_conversion"],
        },
      },
      expiration_timestamp: String,
    },

    // Pricing information
    pricing: {
      billable: {
        type: Boolean,
        default: false,
      },
      pricing_model: {
        type: String,
        enum: ["PMP", "CBP"], // Per Message Pricing, Conversation Based Pricing
      },
      category: {
        type: String,
        enum: ["authentication", "marketing", "utility", "service"],
      },
      type: {
        type: String,
        enum: ["regular", "free_entry_point", "free_tier"],
      },
    },

    // Error information (if status is 'failed')
    errors: [
      {
        code: Number,
        title: String,
        message: String,
        error_data: {
          details: String,
        },
      },
    ],

    // Additional metadata
    gs_id: String,
    meta_msg_id: String,

    // Reference to webhook payload that created this status
    webhook_payload: {
      type: String, // Reference to WebhookPayload._id
      ref: "WebhookPayload",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
messageStatusSchema.index({ message: 1, status: 1 });
messageStatusSchema.index({ whatsapp_message_id: 1 });
messageStatusSchema.index({ recipient_id: 1 });
messageStatusSchema.index({ status: 1, timestamp: 1 });
messageStatusSchema.index({ "conversation.id": 1 });

// Static method to update message status
messageStatusSchema.statics.updateMessageStatus = async function (
  whatsappMessageId,
  status,
  statusData
) {
  const Message = mongoose.model("Message");

  try {
    // Find the original message
    const message = await Message.findOne({
      whatsapp_message_id: whatsappMessageId,
    });
    if (!message) {
      throw new Error(
        `Message not found for WhatsApp ID: ${whatsappMessageId}`
      );
    }

    // Create status record
    const statusRecord = new this({
      message: message._id,
      whatsapp_message_id: whatsappMessageId,
      status: status,
      ...statusData,
    });

    await statusRecord.save();

    // Update the message status and timestamps
    message.status = status;

    if (status === "delivered") {
      message.deliveredAt = new Date(parseInt(statusData.timestamp) * 1000);
    } else if (status === "read") {
      message.readAt = new Date(parseInt(statusData.timestamp) * 1000);
    }

    await message.save();

    return { message, statusRecord };
  } catch (error) {
    console.error("Error updating message status:", error);
    throw error;
  }
};

// Method to get latest status for a message
messageStatusSchema.statics.getLatestStatus = async function (messageId) {
  return await this.findOne({ message: messageId })
    .sort({ timestamp: -1 })
    .populate("message");
};

const MessageStatus = mongoose.model("MessageStatus", messageStatusSchema);

export default MessageStatus;
