import express from "express";
import { Message, Conversation, User, MessageStatus } from "../models/index.js";
import {
  getConversationMessages,
  createOutgoingMessage,
} from "../utils/webhookProcessor.js";
import mongoose from "mongoose";

const router = express.Router();

// Get all conversations for the current user with last messages
router.get("/conversations", async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find all conversations for this user
    const conversations = await Conversation.find({
      participants: userObjectId,
    })
      .populate({
        path: "participants",
        select:
          "username profilePicture status isOnline lastSeen email wa_id phone_number display_phone_number profile",
      })
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender recipient",
          select: "username profilePicture wa_id phone_number",
        },
      })
      .sort("-lastMessageAt");

    // Format the response with WhatsApp data
    const formattedConversations = conversations.map((conv) => {
      // Find the other participant (not the current user)
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== userId
      );

      return {
        _id: conv._id,
        user: {
          ...otherParticipant?.toObject(),
          // Include WhatsApp specific fields
          whatsapp_name:
            otherParticipant?.profile?.name || otherParticipant?.username,
          phone_number:
            otherParticipant?.wa_id || otherParticipant?.phone_number,
        },
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount?.get(userId) || 0,
        isArchived: conv.isArchived?.get(userId) || false,
        isPinned: conv.isPinned?.get(userId) || false,
        isMuted: conv.isMuted?.get(userId) || false,
        isGroup: conv.isGroup,
        groupName: conv.groupName,
        groupAvatar: conv.groupAvatar,
        // WhatsApp specific fields
        whatsapp_conversation_id: conv.whatsapp_conversation_id,
        phone_number_id: conv.phone_number_id,
        display_phone_number: conv.display_phone_number,
        contacts: conv.contacts,
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark messages as read in a conversation
router.put("/conversations/:userId/read", async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    // Update all unread messages
    await Message.updateMany(
      {
        sender: otherUserId,
        recipient: currentUserId,
        status: { $ne: "read" },
      },
      {
        status: "read",
        readAt: new Date(),
      }
    );

    // Reset unread count in conversation
    const conversation = await Conversation.findOrCreateConversation(
      currentUserId,
      otherUserId
    );
    await conversation.resetUnreadCount(currentUserId);

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get messages between two users (enhanced with WhatsApp data)
router.get("/:userId", async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    // Find conversation first
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
    });

    if (!conversation) {
      return res.json([]); // No conversation exists yet
    }

    // Use the enhanced getConversationMessages utility
    const messages = await getConversationMessages(conversation._id, 50, 0);

    // Mark messages as read and reset unread count
    await Message.updateMany(
      {
        sender: otherUserId,
        recipient: currentUserId,
        status: { $ne: "read" },
      },
      {
        status: "read",
        readAt: new Date(),
      }
    );

    await conversation.resetUnreadCount(currentUserId);

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Send a message (enhanced to support WhatsApp features)
router.post("/", async (req, res) => {
  try {
    const {
      recipientId,
      content,
      type = "text",
      mediaUrl = "",
      whatsappData = {},
    } = req.body;
    const senderId = req.user.id;

    // Check if recipient exists, if not find by phone number
    let recipient = await User.findById(recipientId);
    if (!recipient && whatsappData.recipientPhone) {
      recipient = await User.findOne({
        $or: [
          { wa_id: whatsappData.recipientPhone },
          { phone_number: whatsappData.recipientPhone },
        ],
      });
    }

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Create message using the enhanced utility
    const message = await createOutgoingMessage(
      senderId,
      recipient.wa_id || recipient.phone_number,
      content,
      type,
      {
        mediaUrl,
        ...whatsappData,
      }
    );

    // Populate sender and recipient info for response
    await message.populate(
      "sender",
      "username profilePicture wa_id phone_number"
    );
    await message.populate(
      "recipient",
      "username profilePicture wa_id phone_number"
    );

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update message status (enhanced with WhatsApp status tracking)
router.put("/:messageId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const messageId = req.params.messageId;

    const update = { status };
    if (status === "delivered") {
      update.deliveredAt = new Date();
    } else if (status === "read") {
      update.readAt = new Date();
    }

    const message = await Message.findByIdAndUpdate(messageId, update, {
      new: true,
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    console.error("Update message status error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get message status history (NEW - WhatsApp specific)
router.get("/:messageId/status-history", async (req, res) => {
  try {
    const messageId = req.params.messageId;

    // Find message to get WhatsApp message ID
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Get status history
    const statusHistory = await MessageStatus.find({
      $or: [
        { message: messageId },
        { whatsapp_message_id: message.whatsapp_message_id },
      ],
    }).sort({ timestamp: 1 });

    res.json(statusHistory);
  } catch (error) {
    console.error("Get message status history error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Search messages (enhanced with WhatsApp data)
router.get("/search/:query", async (req, res) => {
  try {
    const userId = req.user.id;
    const query = req.params.query;

    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
      $text: { $search: query },
    })
      .populate("sender", "username profilePicture wa_id phone_number profile")
      .populate(
        "recipient",
        "username profilePicture wa_id phone_number profile"
      )
      .populate("conversation", "participants")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    console.error("Search messages error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete message
router.delete("/:messageId", async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await message.deleteOne();
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get conversation by phone number (NEW - WhatsApp specific)
router.get("/phone/:phoneNumber", async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const phoneNumber = req.params.phoneNumber;

    // Find user by phone number
    const otherUser = await User.findOne({
      $or: [{ wa_id: phoneNumber }, { phone_number: phoneNumber }],
    });

    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get messages between users
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUser._id] },
    });

    if (!conversation) {
      return res.json({ user: otherUser, messages: [] });
    }

    const messages = await getConversationMessages(conversation._id, 50, 0);

    res.json({
      user: otherUser,
      conversation: conversation,
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error("Get conversation by phone error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// WhatsApp message operations endpoint
router.post("/whatsapp", async (req, res) => {
  try {
    const { action, ...data } = req.body;

    switch (action) {
      case "send":
        const result = await createOutgoingMessage(
          req.user.id,
          data.to,
          data.content,
          data.type || "text",
          {
            whatsapp_message_id: data.whatsapp_message_id,
            template_name: data.template_name,
            template_language: data.template_language,
          }
        );
        res.json(result);
        break;

      case "getByPhone":
        // Get messages by phone number
        const messages = await Message.find({
          $or: [
            { "sender.wa_id": data.phone },
            { "recipient.wa_id": data.phone },
          ],
        })
          .sort({ timestamp: -1 })
          .limit(50);
        res.json(messages);
        break;

      default:
        res.status(400).json({ error: "Invalid WhatsApp action" });
    }
  } catch (error) {
    console.error("WhatsApp endpoint error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
