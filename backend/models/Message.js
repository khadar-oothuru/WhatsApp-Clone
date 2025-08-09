import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Basic message fields
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "location",
        "contact",
      ],
      default: "text",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    readAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },

    // WhatsApp specific fields
    whatsapp_message_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    whatsapp_timestamp: {
      type: String, // WhatsApp sends timestamp as string
    },
    from_phone: {
      type: String,
    },
    to_phone: {
      type: String,
    },
    phone_number_id: {
      type: String,
    },
    display_phone_number: {
      type: String,
    },
    messaging_product: {
      type: String,
      default: "whatsapp",
    },

    // Message context and metadata
    context: {
      message_id: String,
      from: String,
    },

    // Interactive message fields
    interactive: {
      type: {
        type: String,
        enum: ["button", "list", "product", "product_list"],
      },
      header: {
        type: String,
        text: String,
        video: String,
        image: String,
        document: String,
      },
      body: {
        text: String,
      },
      footer: {
        text: String,
      },
      action: mongoose.Schema.Types.Mixed,
    },

    // Button reply
    button: {
      payload: String,
      text: String,
    },

    // List reply
    list_reply: {
      id: String,
      title: String,
      description: String,
    },

    // Location
    location: {
      latitude: Number,
      longitude: Number,
      name: String,
      address: String,
    },

    // Contact
    contacts: [
      {
        name: {
          formatted_name: String,
          first_name: String,
          last_name: String,
        },
        phones: [
          {
            phone: String,
            type: String,
            wa_id: String,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ from_phone: 1, to_phone: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
