import mongoose from "mongoose";

const webhookPayloadSchema = new mongoose.Schema(
  {
    // Unique identifier for the webhook payload
    _id: {
      type: String,
      required: true,
    },

    // Type of payload
    payload_type: {
      type: String,
      enum: ["whatsapp_webhook", "whatsapp_status", "whatsapp_message"],
      default: "whatsapp_webhook",
    },

    // Main webhook metadata
    metaData: {
      // WhatsApp Business Account object
      object: {
        type: String,
        default: "whatsapp_business_account",
      },

      // App ID
      gs_app_id: String,

      // Entry array containing the actual webhook data
      entry: [
        {
          id: String, // Entry ID
          changes: [
            {
              field: {
                type: String,
                enum: [
                  "messages",
                  "message_template_status_update",
                  "account_alerts",
                  "account_update",
                ],
              },
              value: {
                // Messaging product
                messaging_product: {
                  type: String,
                  default: "whatsapp",
                },

                // Metadata about the phone number
                metadata: {
                  display_phone_number: String,
                  phone_number_id: String,
                },

                // Contact information
                contacts: [
                  {
                    profile: {
                      name: String,
                    },
                    wa_id: String,
                  },
                ],

                // Messages array
                messages: [
                  {
                    from: String,
                    id: String,
                    timestamp: String,
                    type: {
                      type: String,
                      enum: [
                        "text",
                        "image",
                        "video",
                        "audio",
                        "document",
                        "location",
                        "contacts",
                        "interactive",
                        "button",
                        "list_reply",
                      ],
                    },

                    // Text message
                    text: {
                      body: String,
                    },

                    // Image message
                    image: {
                      caption: String,
                      mime_type: String,
                      sha256: String,
                      id: String,
                    },

                    // Video message
                    video: {
                      caption: String,
                      filename: String,
                      mime_type: String,
                      sha256: String,
                      id: String,
                    },

                    // Audio message
                    audio: {
                      mime_type: String,
                      sha256: String,
                      id: String,
                      voice: Boolean,
                    },

                    // Document message
                    document: {
                      caption: String,
                      filename: String,
                      mime_type: String,
                      sha256: String,
                      id: String,
                    },

                    // Location message
                    location: {
                      longitude: Number,
                      latitude: Number,
                      name: String,
                      address: String,
                    },

                    // Contacts message
                    contacts: [
                      {
                        name: {
                          formatted_name: String,
                          first_name: String,
                          last_name: String,
                          middle_name: String,
                          suffix: String,
                          prefix: String,
                        },
                        birthday: String,
                        phones: [
                          {
                            phone: String,
                            wa_id: String,
                            type: String,
                          },
                        ],
                        emails: [
                          {
                            email: String,
                            type: String,
                          },
                        ],
                        urls: [
                          {
                            url: String,
                            type: String,
                          },
                        ],
                      },
                    ],

                    // Interactive message
                    interactive: {
                      type: String,
                      button_reply: {
                        id: String,
                        title: String,
                      },
                      list_reply: {
                        id: String,
                        title: String,
                        description: String,
                      },
                    },

                    // Button message
                    button: {
                      payload: String,
                      text: String,
                    },

                    // Context (reply to message)
                    context: {
                      from: String,
                      id: String,
                    },

                    // Errors
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
                  },
                ],

                // Status updates
                statuses: [
                  {
                    id: String,
                    status: {
                      type: String,
                      enum: ["sent", "delivered", "read", "failed"],
                    },
                    timestamp: String,
                    recipient_id: String,
                    conversation: {
                      id: String,
                      origin: {
                        type: String,
                      },
                      expiration_timestamp: String,
                    },
                    pricing: {
                      billable: Boolean,
                      pricing_model: String,
                      category: String,
                    },
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
                  },
                ],
              },
            },
          ],
        },
      ],

      // Processing timestamps
      startedAt: String,
      completedAt: String,
      executed: Boolean,
    },

    // Processing information
    createdAt: {
      type: String,
      required: true,
    },
    startedAt: {
      type: String,
      required: true,
    },
    completedAt: {
      type: String,
      required: true,
    },
    executed: {
      type: Boolean,
      default: false,
    },

    // Processing status
    processed: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: Date,
    },
    processingError: {
      type: String,
    },

    // References to created entities
    createdMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    updatedConversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
webhookPayloadSchema.index({ "metaData.entry.changes.value.messages.id": 1 });
webhookPayloadSchema.index({ "metaData.entry.changes.value.messages.from": 1 });
webhookPayloadSchema.index({
  "metaData.entry.changes.value.messages.timestamp": 1,
});
webhookPayloadSchema.index({ processed: 1, createdAt: 1 });
webhookPayloadSchema.index({ payload_type: 1 });
webhookPayloadSchema.index({ executed: 1 });

// Method to mark as processed
webhookPayloadSchema.methods.markAsProcessed = async function (
  messageId = null,
  conversationId = null,
  userId = null
) {
  this.processed = true;
  this.processedAt = new Date();
  if (messageId) this.createdMessage = messageId;
  if (conversationId) this.updatedConversation = conversationId;
  if (userId) this.relatedUser = userId;
  return await this.save();
};

// Method to mark processing error
webhookPayloadSchema.methods.markProcessingError = async function (error) {
  this.processingError = error.message || error;
  return await this.save();
};

// Static method to find unprocessed webhooks
webhookPayloadSchema.statics.findUnprocessed = function () {
  return this.find({ processed: false, executed: true });
};

const WebhookPayload = mongoose.model("WebhookPayload", webhookPayloadSchema);

export default WebhookPayload;
