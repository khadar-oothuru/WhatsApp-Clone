import {
  User,
  Message,
  Conversation,
  WebhookPayload,
  MessageStatus,
} from "../models/index.js";

/**
 * Process incoming WhatsApp webhook payload
 * @param {Object} webhookData - The webhook payload data
 * @returns {Object} Processing result
 */
export const processWebhookPayload = async (webhookData) => {
  try {
    console.log("Processing webhook payload:", webhookData._id);

    // Save the webhook payload first
    const webhookPayload = new WebhookPayload(webhookData);
    await webhookPayload.save();

    const results = {
      webhookId: webhookData._id,
      processed: [],
      errors: [],
    };

    // Process each entry in the webhook
    for (const entry of webhookData.metaData.entry) {
      const entryResults = await processWebhookEntry(entry, webhookPayload._id);
      results.processed.push(...entryResults.processed);
      results.errors.push(...entryResults.errors);
    }

    // Mark webhook as processed
    await webhookPayload.markAsProcessed();

    return results;
  } catch (error) {
    console.error("Error processing webhook payload:", error);
    throw error;
  }
};

/**
 * Process a single webhook entry
 * @param {Object} entry - Webhook entry data
 * @param {String} webhookId - ID of the webhook payload
 * @returns {Object} Processing result
 */
const processWebhookEntry = async (entry, webhookId) => {
  const results = {
    processed: [],
    errors: [],
  };

  for (const change of entry.changes) {
    if (change.field === "messages") {
      const changeResults = await processMessagesChange(
        change.value,
        webhookId
      );
      results.processed.push(...changeResults.processed);
      results.errors.push(...changeResults.errors);
    }
  }

  return results;
};

/**
 * Process messages change from webhook
 * @param {Object} value - Messages change value
 * @param {String} webhookId - ID of the webhook payload
 * @returns {Object} Processing result
 */
const processMessagesChange = async (value, webhookId) => {
  const results = {
    processed: [],
    errors: [],
  };

  // Process messages
  if (value.messages && value.messages.length > 0) {
    for (const messageData of value.messages) {
      try {
        const result = await processIncomingMessage(
          messageData,
          value,
          webhookId
        );
        results.processed.push(result);
      } catch (error) {
        console.error("Error processing message:", error);
        results.errors.push({
          type: "message",
          messageId: messageData.id,
          error: error.message,
        });
      }
    }
  }

  // Process status updates
  if (value.statuses && value.statuses.length > 0) {
    for (const statusData of value.statuses) {
      try {
        const result = await processStatusUpdate(statusData, webhookId);
        results.processed.push(result);
      } catch (error) {
        console.error("Error processing status:", error);
        results.errors.push({
          type: "status",
          messageId: statusData.id,
          error: error.message,
        });
      }
    }
  }

  return results;
};

/**
 * Process incoming WhatsApp message
 * @param {Object} messageData - Message data from webhook
 * @param {Object} contextData - Context data (metadata, contacts, etc.)
 * @param {String} webhookId - ID of the webhook payload
 * @returns {Promise<Object>} Processing result
 */
const processIncomingMessage = async (messageData, contextData, webhookId) => {
  try {
    // Get user information
    const { senderUser, recipientUser } = await createOrFindUsers(
      messageData,
      contextData
    );

    // Get conversation
    const conversation = await createOrFindConversation(
      senderUser,
      recipientUser,
      contextData
    );

    // Extract message content
    const messageContent = extractMessageContent(messageData);

    // Create message
    const message = await createMessage(
      senderUser,
      recipientUser,
      conversation,
      messageData,
      contextData,
      messageContent
    );

    // Update conversation
    await updateConversationAfterMessage(conversation, message, recipientUser);

    return {
      type: "message",
      messageId: message._id,
      whatsappMessageId: messageData.id,
      conversationId: conversation._id,
      from: messageData.from,
      to: contextData.metadata.display_phone_number,
    };
  } catch (error) {
    console.error("Error processing incoming message:", error);
    throw error;
  }
};

/**
 * Create or find users for a message
 * @param {Object} messageData - Message data
 * @param {Object} contextData - Context data
 * @returns {Promise<Object>} User objects
 */
const createOrFindUsers = async (messageData, contextData) => {
  const fromPhone = messageData.from;
  const toPhone = contextData.metadata.display_phone_number;
  const contactInfo = contextData.contacts?.find((c) => c.wa_id === fromPhone);

  // Find or create sender user
  let senderUser = await User.findOne({ wa_id: fromPhone });
  if (!senderUser) {
    senderUser = await createUser({
      wa_id: fromPhone,
      phone_number: fromPhone,
      profile: { name: contactInfo?.profile?.name || `User ${fromPhone}` },
      username: `user_${fromPhone}`,
      email: `${fromPhone}@whatsapp.temp`,
      phone_number_id: contextData.metadata.phone_number_id,
      display_phone_number: contextData.metadata.display_phone_number,
    });
  }

  // Find or create recipient user (business account)
  let recipientUser = await User.findOne({
    display_phone_number: toPhone,
    phone_number_id: contextData.metadata.phone_number_id,
  });

  if (!recipientUser) {
    recipientUser = await createUser({
      display_phone_number: toPhone,
      phone_number_id: contextData.metadata.phone_number_id,
      phone_number: toPhone,
      username: `business_${toPhone}`,
      email: `business_${toPhone}@whatsapp.temp`,
      profile: { name: `Business ${toPhone}` },
    });
  }

  return { senderUser, recipientUser };
};

/**
 * Create a new user with default password
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async (userData) => {
  const user = new User({
    ...userData,
    password: "temp_password_" + Math.random().toString(36).substring(2, 15),
  });
  return await user.save();
};

/**
 * Create or find conversation for users
 * @param {Object} senderUser - Sender user
 * @param {Object} recipientUser - Recipient user
 * @param {Object} contextData - Context data
 * @returns {Promise<Object>} Conversation
 */
const createOrFindConversation = async (
  senderUser,
  recipientUser,
  contextData
) => {
  const conversation = await Conversation.findOrCreateConversation(
    senderUser._id,
    recipientUser._id
  );

  // Update conversation with WhatsApp data
  conversation.phone_number_id = contextData.metadata.phone_number_id;
  conversation.display_phone_number = contextData.metadata.display_phone_number;
  conversation.contacts = contextData.contacts || [];
  await conversation.save();

  return conversation;
};

/**
 * Extract content from message based on type
 * @param {Object} messageData - Message data
 * @returns {Object} Message content and additional data
 */
const extractMessageContent = (messageData) => {
  let content = "";
  const messageType = messageData.type;
  const additionalData = {};

  switch (messageData.type) {
    case "text":
      content = messageData.text.body;
      break;
    case "image":
      content = messageData.image.caption || "Image";
      additionalData.mediaUrl = messageData.image.id;
      additionalData.image = messageData.image;
      break;
    case "video":
      content = messageData.video.caption || "Video";
      additionalData.mediaUrl = messageData.video.id;
      additionalData.video = messageData.video;
      break;
    case "audio":
      content = "Audio message";
      additionalData.mediaUrl = messageData.audio.id;
      additionalData.audio = messageData.audio;
      break;
    case "document":
      content =
        messageData.document.caption ||
        messageData.document.filename ||
        "Document";
      additionalData.mediaUrl = messageData.document.id;
      additionalData.document = messageData.document;
      break;
    case "location":
      content = messageData.location.name || "Location";
      additionalData.location = messageData.location;
      break;
    case "contacts":
      content = `Contact: ${
        messageData.contacts[0]?.name?.formatted_name || "Unknown"
      }`;
      additionalData.contacts = messageData.contacts;
      break;
    case "interactive":
      content = extractInteractiveContent(messageData);
      additionalData.interactive = messageData.interactive;
      break;
    default:
      content = `${messageData.type} message`;
  }

  return { content, messageType, additionalData };
};

/**
 * Extract content from interactive message
 * @param {Object} messageData - Message data
 * @returns {String} Content
 */
const extractInteractiveContent = (messageData) => {
  if (messageData.interactive.button_reply) {
    return messageData.interactive.button_reply.title;
  } else if (messageData.interactive.list_reply) {
    return messageData.interactive.list_reply.title;
  }
  return "Interactive message";
};

/**
 * Create message in database
 * @param {Object} senderUser - Sender user
 * @param {Object} recipientUser - Recipient user
 * @param {Object} conversation - Conversation
 * @param {Object} messageData - Message data
 * @param {Object} contextData - Context data
 * @param {Object} messageContent - Extracted message content
 * @returns {Promise<Object>} Created message
 */
const createMessage = async (
  senderUser,
  recipientUser,
  conversation,
  messageData,
  contextData,
  messageContent
) => {
  const message = new Message({
    sender: senderUser._id,
    recipient: recipientUser._id,
    conversation: conversation._id,
    content: messageContent.content,
    type: messageContent.messageType,
    whatsapp_message_id: messageData.id,
    whatsapp_timestamp: messageData.timestamp,
    from_phone: messageData.from,
    to_phone: contextData.metadata.display_phone_number,
    phone_number_id: contextData.metadata.phone_number_id,
    display_phone_number: contextData.metadata.display_phone_number,
    ...messageContent.additionalData,
  });

  return await message.save();
};

/**
 * Update conversation after message is created
 * @param {Object} conversation - Conversation
 * @param {Object} message - Created message
 * @param {Object} recipientUser - Recipient user
 * @returns {Promise<void>}
 */
const updateConversationAfterMessage = async (
  conversation,
  message,
  recipientUser
) => {
  await conversation.updateLastMessage(message._id);
  await conversation.incrementUnreadCount(recipientUser._id);
};

/**
 * Process WhatsApp status update
 * @param {Object} statusData - Status data from webhook
 * @param {String} webhookId - ID of the webhook payload
 * @returns {Promise<Object>} Processing result
 */
const processStatusUpdate = async (statusData, webhookId) => {
  try {
    const result = await MessageStatus.updateMessageStatus(
      statusData.id,
      statusData.status,
      {
        timestamp: statusData.timestamp,
        recipient_id: statusData.recipient_id,
        conversation: statusData.conversation,
        pricing: statusData.pricing,
        errors: statusData.errors,
        gs_id: statusData.gs_id,
        meta_msg_id: statusData.meta_msg_id,
        webhook_payload: webhookId,
      }
    );

    return {
      type: "status",
      messageId: result.message._id,
      whatsappMessageId: statusData.id,
      status: statusData.status,
      recipientId: statusData.recipient_id,
    };
  } catch (error) {
    console.error("Error processing status update:", error);
    throw error;
  }
};

/**
 * Create outgoing WhatsApp message
 * @param {String} fromUserId - ID of sender user
 * @param {String} toPhone - Recipient phone number
 * @param {String} content - Message content
 * @param {String} type - Message type
 * @param {Object} additionalData - Additional message data
 * @returns {Promise<Object>} Created message
 */
export const createOutgoingMessage = async (
  fromUserId,
  toPhone,
  content,
  type = "text",
  additionalData = {}
) => {
  try {
    // Find sender
    const senderUser = await User.findById(fromUserId);
    if (!senderUser) {
      throw new Error("Sender user not found");
    }

    // Find or create recipient
    const recipientUser = await findOrCreateRecipient(toPhone);

    // Find or create conversation
    const conversation = await Conversation.findOrCreateConversation(
      senderUser._id,
      recipientUser._id
    );

    // Create message
    const message = new Message({
      sender: senderUser._id,
      recipient: recipientUser._id,
      conversation: conversation._id,
      content: content,
      type: type,
      from_phone: senderUser.display_phone_number || senderUser.phone_number,
      to_phone: toPhone,
      phone_number_id: senderUser.phone_number_id,
      display_phone_number: senderUser.display_phone_number,
      ...additionalData,
    });

    await message.save();

    // Update conversation
    await conversation.updateLastMessage(message._id);
    await conversation.incrementUnreadCount(recipientUser._id);

    return message;
  } catch (error) {
    console.error("Error creating outgoing message:", error);
    throw error;
  }
};

/**
 * Find or create recipient user
 * @param {String} toPhone - Recipient phone number
 * @returns {Promise<Object>} User object
 */
const findOrCreateRecipient = async (toPhone) => {
  let recipientUser = await User.findOne({ wa_id: toPhone });
  if (!recipientUser) {
    recipientUser = new User({
      wa_id: toPhone,
      phone_number: toPhone,
      username: `user_${toPhone}`,
      email: `${toPhone}@whatsapp.temp`,
      password: "temp_password_" + Math.random().toString(36).substring(2, 15),
      profile: {
        name: `User ${toPhone}`,
      },
    });
    await recipientUser.save();
  }
  return recipientUser;
};

/**
 * Get conversation messages with WhatsApp formatting
 * @param {String} conversationId - Conversation ID
 * @param {Number} limit - Number of messages to fetch
 * @param {Number} skip - Number of messages to skip
 * @returns {Promise<Array>} Formatted messages
 */
export const getConversationMessages = async (
  conversationId,
  limit = 50,
  skip = 0
) => {
  try {
    const messages = await Message.find({ conversation: conversationId })
      .populate(
        "sender",
        "username profile wa_id phone_number display_phone_number"
      )
      .populate(
        "recipient",
        "username profile wa_id phone_number display_phone_number"
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return messages.map((message) => ({
      id: message._id,
      whatsapp_message_id: message.whatsapp_message_id,
      content: message.content,
      type: message.type,
      status: message.status,
      timestamp:
        message.whatsapp_timestamp || message.createdAt.getTime().toString(),
      sender: {
        id: message.sender._id,
        username: message.sender.username,
        wa_id: message.sender.wa_id,
        phone_number: message.sender.phone_number,
        profile: message.sender.profile,
      },
      recipient: {
        id: message.recipient._id,
        username: message.recipient.username,
        wa_id: message.recipient.wa_id,
        phone_number: message.recipient.phone_number,
        profile: message.recipient.profile,
      },
      mediaUrl: message.mediaUrl,
      location: message.location,
      contacts: message.contacts,
      interactive: message.interactive,
      button: message.button,
      list_reply: message.list_reply,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    throw error;
  }
};

export default {
  processWebhookPayload,
  createOutgoingMessage,
  getConversationMessages,
};
