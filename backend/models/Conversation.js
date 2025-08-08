import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: "",
    },
    groupAvatar: {
      type: String,
      default: "",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isArchived: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    isPinned: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    isMuted: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },

    // WhatsApp specific fields
    whatsapp_conversation_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone_number_id: {
      type: String,
    },
    display_phone_number: {
      type: String,
    },
    business_account_id: {
      type: String,
    },
    app_id: {
      type: String,
    },

    // Conversation metadata
    conversation_origin: {
      type: {
        type: String,
        enum: ["user_initiated", "business_initiated", "referral_conversion"],
      },
    },
    expiration_timestamp: {
      type: String,
    },

    // Pricing information
    pricing: {
      billable: Boolean,
      category: {
        type: String,
        enum: ["authentication", "marketing", "utility", "service"],
      },
      pricing_model: {
        type: String,
        enum: ["PMP", "CBP"], // Per Message Pricing, Conversation Based Pricing
      },
    },

    // WhatsApp contact information
    contacts: [
      {
        wa_id: String,
        profile: {
          name: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ whatsapp_conversation_id: 1 });
conversationSchema.index({ phone_number_id: 1 });

// Method to get conversation between two users
conversationSchema.statics.findOrCreateConversation = async function (
  userId1,
  userId2
) {
  // Sort user IDs to ensure consistent ordering
  const participants = [userId1, userId2].sort((a, b) =>
    a.toString().localeCompare(b.toString())
  );

  let conversation = await this.findOne({
    participants: { $all: participants },
    isGroup: false,
  });

  if (!conversation) {
    conversation = await this.create({
      participants,
      unreadCount: new Map([
        [userId1.toString(), 0],
        [userId2.toString(), 0],
      ]),
      isArchived: new Map([
        [userId1.toString(), false],
        [userId2.toString(), false],
      ]),
      isPinned: new Map([
        [userId1.toString(), false],
        [userId2.toString(), false],
      ]),
      isMuted: new Map([
        [userId1.toString(), false],
        [userId2.toString(), false],
      ]),
    });
  }

  return conversation;
};

// Method to find or create conversation by WhatsApp phone numbers
conversationSchema.statics.findOrCreateWhatsAppConversation = async function (
  fromPhone,
  toPhone,
  phoneNumberId
) {
  // Try to find existing conversation
  let conversation = await this.findOne({
    $or: [
      { "contacts.wa_id": { $all: [fromPhone, toPhone] } },
      { phone_number_id: phoneNumberId },
    ],
  });

  if (!conversation) {
    conversation = await this.create({
      participants: [], // Will be populated when users are created/found
      phone_number_id: phoneNumberId,
      contacts: [{ wa_id: fromPhone }, { wa_id: toPhone }],
    });
  }

  return conversation;
};

// Method to update last message
conversationSchema.methods.updateLastMessage = async function (messageId) {
  this.lastMessage = messageId;
  this.lastMessageAt = new Date();
  return await this.save();
};

// Method to increment unread count for a user
conversationSchema.methods.incrementUnreadCount = async function (userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  return await this.save();
};

// Method to reset unread count for a user
conversationSchema.methods.resetUnreadCount = async function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  return await this.save();
};

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
