import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import messageRoutes from "./routes/messages.js";
import webhookRoutes from "./routes/webhooks.js"; // NEW: WhatsApp webhook routes
import { authenticateToken } from "./middleware/auth.js";
import User from "./models/User.js";
import { processWebhookPayload } from "./utils/webhookProcessor.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://whatsapp-khadaroothuru.vercel.app",
    ],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://whatsapp-khadaroothuru.vercel.app",
    ],
    credentials: true,
  })
);

// WhatsApp webhook verification middleware (before json parsing)
app.use("/api/webhooks", express.raw({ type: "application/json" }));

// Increase payload size limit for profile pictures and other data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check routes
app.get("/", (req, res) => {
  res.send("Welcome to the WhatsApp Clone API");
});
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/messages", authenticateToken, messageRoutes);
app.use("/api/webhooks", webhookRoutes); // NEW: WhatsApp webhook routes (no auth needed)

// WhatsApp webhook processor with real-time updates
export const processWhatsAppWebhook = async (webhookData) => {
  try {
    const result = await processWebhookPayload(webhookData);

    // Emit real-time updates to connected clients
    if (result.processed && result.processed.length > 0) {
      for (const item of result.processed) {
        if (item.type === "message") {
          // Emit to specific WhatsApp contact subscribers
          if (item.from) {
            const phoneRoom = `whatsapp:${item.from}`;
            io.to(phoneRoom).emit("whatsapp-message-received", {
              messageId: item.messageId,
              conversationId: item.conversationId,
              from: item.from,
              to: item.to,
            });
          }

          // Emit to conversation subscribers
          if (item.conversationId) {
            const conversationRoom = `whatsapp-conversation:${item.conversationId}`;
            io.to(conversationRoom).emit("whatsapp-message-received", {
              messageId: item.messageId,
              conversationId: item.conversationId,
              from: item.from,
              to: item.to,
            });
          }

          // Broadcast new message to all connected clients
          io.emit("whatsapp-message-received", {
            messageId: item.messageId,
            conversationId: item.conversationId,
            from: item.from,
            to: item.to,
          });
        } else if (item.type === "status") {
          // Emit to specific phone subscribers
          if (item.recipientId) {
            const phoneRoom = `whatsapp:${item.recipientId}`;
            io.to(phoneRoom).emit("whatsapp-status-update", {
              messageId: item.messageId,
              status: item.status,
              recipientId: item.recipientId,
            });
          }

          // Broadcast status update to all
          io.emit("whatsapp-status-update", {
            messageId: item.messageId,
            status: item.status,
            recipientId: item.recipientId,
          });
        }

        // Emit webhook processing notification
        io.emit("whatsapp-webhook-processed", {
          type: item.type,
          success: true,
          item: item,
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
    throw error;
  }
};

// Socket.io connection handling
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle user joining
  socket.on("user-online", async (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;

    // Update user's online status in database
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      });
    } catch (error) {
      console.error("Error updating user online status:", error);
    }

    // Broadcast online status
    io.emit("users-online", Array.from(onlineUsers.keys()));
  });

  // Handle sending messages
  socket.on("send-message", async (data) => {
    const { recipientId, message } = data;
    const recipientSocketId = onlineUsers.get(recipientId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receive-message", {
        senderId: socket.userId,
        message,
        timestamp: new Date(),
      });
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    const { recipientId } = data;
    const recipientSocketId = onlineUsers.get(recipientId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user-typing", {
        userId: socket.userId,
      });
    }
  });

  socket.on("stop-typing", (data) => {
    const { recipientId } = data;
    const recipientSocketId = onlineUsers.get(recipientId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user-stop-typing", {
        userId: socket.userId,
      });
    }
  });

  // ============ WhatsApp Socket Events ============

  // Handle WhatsApp message sending via socket
  socket.on("send-whatsapp-message", async (data) => {
    try {
      const { phoneNumber, message, type = "text" } = data;

      // This would normally send to WhatsApp Business API
      // For now, we'll just broadcast to connected clients
      io.emit("whatsapp-message-sent", {
        phoneNumber,
        message,
        type,
        timestamp: new Date(),
        status: "sent",
      });

      console.log("WhatsApp message sent via socket:", { phoneNumber, type });
    } catch (error) {
      console.error("Error handling WhatsApp message:", error);
      socket.emit("whatsapp-error", {
        error: "Failed to send WhatsApp message",
      });
    }
  });

  // Subscribe to WhatsApp contact updates
  socket.on("subscribe-whatsapp-contact", (data) => {
    const { phoneNumber } = data;
    const roomName = `whatsapp:${phoneNumber}`;
    socket.join(roomName);
    console.log(
      `Socket ${socket.id} subscribed to WhatsApp contact: ${phoneNumber}`
    );
  });

  // Unsubscribe from WhatsApp contact updates
  socket.on("unsubscribe-whatsapp-contact", (data) => {
    const { phoneNumber } = data;
    const roomName = `whatsapp:${phoneNumber}`;
    socket.leave(roomName);
    console.log(
      `Socket ${socket.id} unsubscribed from WhatsApp contact: ${phoneNumber}`
    );
  });

  // Join WhatsApp conversation room
  socket.on("join-whatsapp-conversation", (data) => {
    const { conversationId } = data;
    const roomName = `whatsapp-conversation:${conversationId}`;
    socket.join(roomName);
    console.log(
      `Socket ${socket.id} joined WhatsApp conversation: ${conversationId}`
    );
  });

  // Leave WhatsApp conversation room
  socket.on("leave-whatsapp-conversation", (data) => {
    const { conversationId } = data;
    const roomName = `whatsapp-conversation:${conversationId}`;
    socket.leave(roomName);
    console.log(
      `Socket ${socket.id} left WhatsApp conversation: ${conversationId}`
    );
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);

      // Update user's offline status in database
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
      } catch (error) {
        console.error("Error updating user offline status:", error);
      }

      io.emit("users-online", Array.from(onlineUsers.keys()));
    }
    console.log("Client disconnected:", socket.id);
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    // Start server
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend should run on http://localhost:5173`);
      console.log(`Backend API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    console.error(
      "Please make sure MongoDB is running or update MONGODB_URI in .env file"
    );
    console.error("You can:");
    console.error("1. Install and start MongoDB locally");
    console.error("2. Use MongoDB Atlas (cloud database)");
    console.error(
      "3. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo"
    );
    process.exit(1);
  });

export { io };
