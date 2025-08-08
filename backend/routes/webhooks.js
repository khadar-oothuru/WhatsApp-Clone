import express from "express";
import { processWhatsAppWebhook } from "../server.js";
import { WebhookPayload, MessageStatus } from "../models/index.js";
import {
  createOutgoingMessage,
  processWebhookPayload,
} from "../utils/webhookProcessor.js";
import axios from "axios";

const router = express.Router();

// WhatsApp webhook verification (GET)
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Verify the token matches your configured verify token
  const VERIFY_TOKEN =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "your_verify_token_here";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified successfully!");
    res.status(200).send(challenge);
  } else {
    console.error("WhatsApp webhook verification failed");
    res.status(403).send("Forbidden");
  }
});

// WhatsApp webhook receiver (POST)
router.post("/", async (req, res) => {
  try {
    console.log(
      "Received WhatsApp webhook:",
      JSON.stringify(req.body, null, 2)
    );

    // Process the webhook payload
    const result = await processWhatsAppWebhook({
      _id: `webhook_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      payload_type: "whatsapp_webhook",
      metaData: req.body,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      executed: true,
    });

    console.log("Webhook processed successfully:", result);

    // WhatsApp requires a 200 response within 20 seconds
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Send WhatsApp message (for outgoing messages)
router.post("/send", async (req, res) => {
  try {
    const { to, message, type = "text" } = req.body;

    const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      return res.status(400).json({
        error: "WhatsApp API credentials not configured",
      });
    }

    // Prepare message payload based on type
    let messagePayload = {
      messaging_product: "whatsapp",
      to: to,
      type: type,
    };

    switch (type) {
      case "text":
        messagePayload.text = { body: message };
        break;
      case "template":
        messagePayload.template = message;
        break;
      case "interactive":
        messagePayload.interactive = message;
        break;
      default:
        messagePayload[type] = message;
    }

    // Send message via WhatsApp API
    const response = await axios.post(WHATSAPP_API_URL, messagePayload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("WhatsApp API response:", response.data);

    res.json({
      success: true,
      whatsapp_message_id: response.data.messages[0].id,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    res.status(500).json({
      error: "Failed to send WhatsApp message",
      details: error.response?.data || error.message,
    });
  }
});

// Get webhook processing status
router.get("/status/:webhookId", async (req, res) => {
  try {
    const webhook = await WebhookPayload.findById(req.params.webhookId);

    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }

    res.json({
      id: webhook._id,
      processed: webhook.processed,
      processedAt: webhook.processedAt,
      executed: webhook.executed,
      createdMessage: webhook.createdMessage,
      updatedConversation: webhook.updatedConversation,
      processingError: webhook.processingError,
    });
  } catch (error) {
    console.error("Error getting webhook status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get message status history
router.get("/message-status/:messageId", async (req, res) => {
  try {
    const statuses = await MessageStatus.find({
      whatsapp_message_id: req.params.messageId,
    }).sort({ timestamp: 1 });

    res.json(statuses);
  } catch (error) {
    console.error("Error getting message status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Reprocess failed webhook
router.post("/reprocess/:webhookId", async (req, res) => {
  try {
    const webhook = await WebhookPayload.findById(req.params.webhookId);

    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }

    // Reset processing status
    webhook.processed = false;
    webhook.processedAt = null;
    webhook.processingError = null;
    await webhook.save();

    // Reprocess
    const result = await processWhatsAppWebhook(webhook.toObject());

    res.json({
      success: true,
      result: result,
    });
  } catch (error) {
    console.error("Error reprocessing webhook:", error);
    res.status(500).json({ error: "Reprocessing failed" });
  }
});

// Get webhook statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await WebhookPayload.aggregate([
      {
        $group: {
          _id: "$payload_type",
          count: { $sum: 1 },
          processed: {
            $sum: {
              $cond: [{ $eq: ["$processed", true] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $ne: ["$processingError", null] }, 1, 0],
            },
          },
        },
      },
    ]);

    const messageStats = await MessageStatus.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      webhooks: stats,
      messageStatuses: messageStats,
      totalWebhooks: await WebhookPayload.countDocuments(),
      totalStatuses: await MessageStatus.countDocuments(),
    });
  } catch (error) {
    console.error("Error getting webhook stats:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
