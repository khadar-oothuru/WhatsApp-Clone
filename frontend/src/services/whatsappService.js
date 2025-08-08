import api from "./authService";

export const whatsappService = {
  // ============ WhatsApp Integration Routes ============

  // Send WhatsApp message via API
  async sendWhatsAppMessage(to, message, type = "text") {
    try {
      const response = await api.post("/webhooks/send", {
        to,
        message,
        type,
      });
      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Send message error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to send WhatsApp message"
      );
    }
  },

  // Get webhook processing status
  async getWebhookStatus(webhookId) {
    try {
      const response = await api.get(`/webhooks/status/${webhookId}`);
      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Get webhook status error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to get webhook status"
      );
    }
  },

  // Get message delivery status history
  async getMessageStatusHistory(messageId) {
    try {
      const response = await api.get(`/webhooks/message-status/${messageId}`);
      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Get message status error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to get message status history"
      );
    }
  },

  // Reprocess failed webhook
  async reprocessWebhook(webhookId) {
    try {
      const response = await api.post(`/webhooks/reprocess/${webhookId}`);
      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Reprocess webhook error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to reprocess webhook"
      );
    }
  },

  // Get webhook statistics
  async getWebhookStats() {
    try {
      const response = await api.get("/webhooks/stats");
      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Get webhook stats error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to get webhook statistics"
      );
    }
  },

  // ============ WhatsApp User Management ============

  // Link WhatsApp account to current user
  async linkWhatsAppAccount(whatsappData) {
    try {
      const response = await api.post("/users/link-whatsapp", whatsappData);
      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Link account error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to link WhatsApp account"
      );
    }
  },

  // Unlink WhatsApp account
  async unlinkWhatsAppAccount() {
    try {
      const response = await api.post("/users/unlink-whatsapp");
      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Unlink account error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to unlink WhatsApp account"
      );
    }
  },

  // Find user by phone number
  async getUserByPhone(phoneNumber) {
    try {
      const response = await api.get(`/users/phone/${phoneNumber}`);
      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Get user by phone error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to find user by phone number"
      );
    }
  },

  // ============ WhatsApp Message Templates ============

  // Get available message templates
  async getMessageTemplates() {
    // This would typically come from WhatsApp Business API
    // For now, return mock data
    return [
      {
        id: "hello_world",
        name: "Hello World",
        category: "UTILITY",
        components: [
          {
            type: "BODY",
            text: "Hello World!",
          },
        ],
      },
      {
        id: "order_confirmation",
        name: "Order Confirmation",
        category: "UTILITY",
        components: [
          {
            type: "HEADER",
            format: "TEXT",
            text: "Order Confirmation",
          },
          {
            type: "BODY",
            text: "Your order {{1}} has been confirmed. Total amount: {{2}}",
          },
          {
            type: "FOOTER",
            text: "Thank you for your business!",
          },
        ],
      },
    ];
  },

  // Send template message
  async sendTemplateMessage(to, templateName, templateData = {}) {
    try {
      const templateMessage = {
        name: templateName,
        language: {
          code: templateData.language || "en",
        },
        components: templateData.components || [],
      };

      const response = await api.post("/webhooks/send", {
        to,
        message: templateMessage,
        type: "template",
      });

      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Send template message error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to send template message"
      );
    }
  },

  // ============ WhatsApp Interactive Messages ============

  // Send button message
  async sendButtonMessage(to, text, buttons) {
    try {
      const interactiveMessage = {
        type: "button",
        body: {
          text: text,
        },
        action: {
          buttons: buttons.map((button, index) => ({
            type: "reply",
            reply: {
              id: button.id || `btn_${index}`,
              title: button.title,
            },
          })),
        },
      };

      const response = await api.post("/webhooks/send", {
        to,
        message: interactiveMessage,
        type: "interactive",
      });

      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Send button message error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to send button message"
      );
    }
  },

  // Send list message
  async sendListMessage(to, text, buttonText, sections) {
    try {
      const interactiveMessage = {
        type: "list",
        body: {
          text: text,
        },
        action: {
          button: buttonText,
          sections: sections,
        },
      };

      const response = await api.post("/webhooks/send", {
        to,
        message: interactiveMessage,
        type: "interactive",
      });

      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Send list message error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to send list message"
      );
    }
  },

  // ============ WhatsApp Media Messages ============

  // Send image message
  async sendImageMessage(to, imageUrl, caption = "") {
    try {
      const response = await api.post("/webhooks/send", {
        to,
        message: {
          link: imageUrl,
          caption: caption,
        },
        type: "image",
      });

      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Send image message error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to send image message"
      );
    }
  },

  // Send document message
  async sendDocumentMessage(to, documentUrl, filename, caption = "") {
    try {
      const response = await api.post("/webhooks/send", {
        to,
        message: {
          link: documentUrl,
          filename: filename,
          caption: caption,
        },
        type: "document",
      });

      return response.data;
    } catch (error) {
      console.error("WhatsAppService: Send document message error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to send document message"
      );
    }
  },

  // ============ WhatsApp Utilities ============

  // Validate phone number format for WhatsApp
  validatePhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Check if it's a valid international format (starts with country code)
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      return {
        valid: true,
        formatted: cleaned,
        display: `+${cleaned}`,
      };
    }

    return {
      valid: false,
      error:
        "Invalid phone number format. Please use international format (e.g., +1234567890)",
    };
  },

  // Format message for display
  formatMessage(message) {
    return {
      id: message.id,
      content: message.content,
      type: message.type,
      timestamp: new Date(message.whatsapp_timestamp || message.createdAt),
      status: message.status,
      sender: {
        name: message.sender?.whatsapp_name || message.sender?.username,
        phone: message.sender?.phone_number,
        isWhatsApp: !!message.sender?.wa_id,
      },
      recipient: {
        name: message.recipient?.whatsapp_name || message.recipient?.username,
        phone: message.recipient?.phone_number,
        isWhatsApp: !!message.recipient?.wa_id,
      },
      isWhatsApp: !!(message.whatsapp_message_id || message.from_phone),
      mediaUrl: message.mediaUrl,
      location: message.location,
      contacts: message.contacts,
      interactive: message.interactive,
    };
  },

  // Get message status icon
  getStatusIcon(status) {
    switch (status) {
      case "sent":
        return "✓";
      case "delivered":
        return "✓✓";
      case "read":
        return "✓✓"; // Usually blue in WhatsApp
      case "failed":
        return "❌";
      default:
        return "⏳";
    }
  },
};

export default whatsappService;
