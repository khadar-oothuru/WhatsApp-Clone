# WhatsApp Clone - Updated Models Documentation

This document explains the updated database models that are now properly aligned with WhatsApp Business API webhook payloads.

## 📋 Overview of Updated Models

### 1. **User Model** (`User.js`)
Enhanced to support WhatsApp-specific fields:
- `wa_id`: WhatsApp ID (phone number)
- `phone_number`: User's phone number  
- `display_phone_number`: Business display number
- `phone_number_id`: WhatsApp Business API phone number ID
- `profile.name`: WhatsApp profile name
- `business_account_id`: Business account identifier
- `app_id`: WhatsApp app identifier

### 2. **Message Model** (`Message.js`)
Completely redesigned to handle WhatsApp message types:
- Basic chat features (sender, recipient, content, type, status)
- WhatsApp-specific IDs (`whatsapp_message_id`, `phone_number_id`)
- Multiple message types (text, image, video, audio, document, location, contacts)
- Interactive messages (buttons, lists)
- Message context for replies
- Delivery tracking (sent, delivered, read, failed)

### 3. **Conversation Model** (`Conversation.js`)
Enhanced for WhatsApp conversation management:
- Participant management with user references
- WhatsApp conversation tracking (`whatsapp_conversation_id`)
- Business account integration
- Conversation metadata (origin, expiration, pricing)
- Contact information from WhatsApp

### 4. **WebhookPayload Model** (`WebhookPayload.js`) - **NEW**
Stores complete WhatsApp webhook payloads:
- Full webhook structure preservation
- Message and status tracking
- Processing status management
- Error handling and retry logic
- References to created entities

### 5. **MessageStatus Model** (`MessageStatus.js`) - **NEW**
Tracks message delivery status updates:
- Status progression (sent → delivered → read)
- WhatsApp pricing and billing information
- Conversation context
- Error tracking for failed messages

## 🔧 Key Features

### WhatsApp Webhook Processing
The `webhookProcessor.js` utility handles:
- Incoming message processing
- Status update handling
- User creation from phone numbers
- Conversation management
- Error handling and logging

### Sample Usage

```javascript
import { processWebhookPayload, createOutgoingMessage, getConversationMessages } from './utils/webhookProcessor.js';

// Process incoming webhook
const result = await processWebhookPayload(webhookData);

// Create outgoing message
const message = await createOutgoingMessage(
  senderId, 
  recipientPhone, 
  "Hello from WhatsApp!", 
  'text'
);

// Get conversation messages
const messages = await getConversationMessages(conversationId, 50, 0);
```

## 📊 Database Indexes

All models include optimized indexes for:
- Fast message queries by conversation
- User lookups by WhatsApp ID and phone number
- Status updates by message ID
- Webhook payload tracking
- Conversation participant queries

## 🧪 Testing

Run the test file to verify everything works with your sample payloads:

```bash
node test-webhook-processing.js
```

This will:
1. Process all sample webhook payloads
2. Create users and conversations
3. Track message statuses
4. Generate database statistics

## 📱 Supported Message Types

- **Text**: Plain text messages
- **Image**: Images with optional captions
- **Video**: Videos with optional captions
- **Audio**: Audio messages and voice notes
- **Document**: File attachments
- **Location**: GPS coordinates with address
- **Contacts**: vCard contact information
- **Interactive**: Button and list responses

## 🔄 Status Tracking

Messages progress through these statuses:
1. **sent**: Message sent to WhatsApp
2. **delivered**: Message delivered to recipient's device
3. **read**: Message read by recipient
4. **failed**: Message delivery failed

## 🏗️ Model Relationships

```
User ←→ Message ←→ Conversation
  ↓         ↓
WebhookPayload → MessageStatus
```

- Users participate in Conversations
- Messages belong to Conversations and reference sender/recipient
- WebhookPayloads create Messages and trigger MessageStatus updates
- MessageStatus tracks delivery progression

## 🚀 Next Steps

1. Update your API endpoints to use the new models
2. Implement webhook endpoint to receive WhatsApp payloads
3. Add message sending functionality via WhatsApp Business API
4. Set up real-time updates using Socket.IO
5. Implement media handling for images, videos, and documents

## 📋 Environment Setup

Make sure your `.env` file includes:
```
MONGODB_URI=mongodb://localhost:27017/whatsapp-clone
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
```

The models are now fully compatible with WhatsApp Business API webhooks and ready for production use!
