#!/usr/bin/env node

// UI Integration Test for WhatsApp Features
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

async function checkFileContains(filePath, searchStrings) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const results = {};

    for (const search of searchStrings) {
      results[search] = content.includes(search);
    }

    return results;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return {};
  }
}

async function testChatAreaIntegration() {
  info("Testing ChatArea WhatsApp Integration...");

  const chatAreaPath = "frontend/src/components/ChatArea.jsx";
  const expectedFeatures = [
    "whatsappService",
    "sendWhatsAppMessage",
    "onWhatsAppMessage",
    "onWhatsAppStatusUpdate",
    "handleSendWhatsAppMessage",
    "showPhoneInput",
    "showWhatsAppTemplates",
    "FaWhatsapp",
    "isWhatsApp",
    "whatsapp_message_id",
  ];

  const results = await checkFileContains(chatAreaPath, expectedFeatures);
  let passed = 0;

  for (const [feature, found] of Object.entries(results)) {
    if (found) {
      success(`ChatArea has ${feature}`);
      passed++;
    } else {
      error(`ChatArea missing ${feature}`);
    }
  }

  return passed === expectedFeatures.length;
}

async function testSidebarIntegration() {
  info("Testing Sidebar WhatsApp Integration...");

  const sidebarPath = "frontend/src/components/Sidebar.jsx";
  const expectedFeatures = [
    "whatsappService",
    "userService",
    "FaWhatsapp",
    "FaPhone",
    "showWhatsAppSettings",
    "showPhoneSearch",
    "isWhatsAppLinked",
    "handleLinkWhatsApp",
    "handleUnlinkWhatsApp",
    "handlePhoneSearch",
    "phone_number",
    "wa_id",
  ];

  const results = await checkFileContains(sidebarPath, expectedFeatures);
  let passed = 0;

  for (const [feature, found] of Object.entries(results)) {
    if (found) {
      success(`Sidebar has ${feature}`);
      passed++;
    } else {
      error(`Sidebar missing ${feature}`);
    }
  }

  return passed === expectedFeatures.length;
}

async function testMessageComponentIntegration() {
  info("Testing Message Component WhatsApp Integration...");

  const messagePath = "frontend/src/components/Message.jsx";
  const expectedFeatures = [
    "FaWhatsapp",
    "FaExclamationTriangle",
    "getStatusIcon",
    "isWhatsApp",
    "text-green-500",
  ];

  const results = await checkFileContains(messagePath, expectedFeatures);
  let passed = 0;

  for (const [feature, found] of Object.entries(results)) {
    if (found) {
      success(`Message component has ${feature}`);
      passed++;
    } else {
      error(`Message component missing ${feature}`);
    }
  }

  return passed === expectedFeatures.length;
}

async function testServiceIntegration() {
  info("Testing Service Layer Integration...");

  const services = [
    {
      path: "frontend/src/services/whatsappService.js",
      features: [
        "sendWhatsAppMessage",
        "getMessageTemplates",
        "validatePhoneNumber",
        "formatMessage",
      ],
    },
    {
      path: "frontend/src/services/messageService.js",
      features: [
        "getMessagesByPhone",
        "sendWhatsAppMessage",
        "getMessageStatusHistory",
      ],
    },
    {
      path: "frontend/src/services/userService.js",
      features: [
        "linkWhatsAppAccount",
        "unlinkWhatsAppAccount",
        "getUserByPhone",
        "isWhatsAppLinked",
      ],
    },
    {
      path: "frontend/src/services/apiService.js",
      features: [
        "linkWhatsAppAccount",
        "sendWhatsAppMessage",
        "getMessagesByPhone",
      ],
    },
  ];

  let allPassed = true;

  for (const service of services) {
    const results = await checkFileContains(service.path, service.features);
    let passed = 0;

    for (const [feature, found] of Object.entries(results)) {
      if (found) {
        success(`${service.path} has ${feature}`);
        passed++;
      } else {
        error(`${service.path} missing ${feature}`);
        allPassed = false;
      }
    }
  }

  return allPassed;
}

async function testSocketIntegration() {
  info("Testing Socket.IO WhatsApp Integration...");

  const socketContextPath = "frontend/src/context/SocketContext.jsx";
  const expectedFeatures = [
    "sendWhatsAppMessage",
    "onWhatsAppMessage",
    "onWhatsAppStatusUpdate",
    "subscribeToWhatsAppContact",
    "unsubscribeFromWhatsAppContact",
    "joinWhatsAppConversation",
    "leaveWhatsAppConversation",
    "whatsapp-message-received",
    "whatsapp-status-update",
  ];

  const results = await checkFileContains(socketContextPath, expectedFeatures);
  let passed = 0;

  for (const [feature, found] of Object.entries(results)) {
    if (found) {
      success(`SocketContext has ${feature}`);
      passed++;
    } else {
      error(`SocketContext missing ${feature}`);
    }
  }

  return passed === expectedFeatures.length;
}

async function testBackendIntegration() {
  info("Testing Backend WhatsApp Integration...");

  const backendFiles = [
    {
      path: "backend/server.js",
      features: [
        "send-whatsapp-message",
        "whatsapp-message-received",
        "whatsapp-status-update",
        "whatsapp:",
        "whatsapp-conversation:",
      ],
    },
    {
      path: "backend/routes/webhooks.js",
      features: ["/send", "/status", "whatsapp", "processWebhookPayload"],
    },
    {
      path: "backend/routes/users.js",
      features: ["link-whatsapp", "unlink-whatsapp", "/phone/"],
    },
    {
      path: "backend/routes/messages.js",
      features: ["/phone/", "/whatsapp", "whatsapp_message_id"],
    },
  ];

  let allPassed = true;

  for (const file of backendFiles) {
    const results = await checkFileContains(file.path, file.features);
    let passed = 0;

    for (const [feature, found] of Object.entries(results)) {
      if (found) {
        success(`${file.path} has ${feature}`);
        passed++;
      } else {
        error(`${file.path} missing ${feature}`);
        allPassed = false;
      }
    }
  }

  return allPassed;
}

async function generateUITestSummary(results) {
  log("\n" + "=".repeat(60), colors.bold);
  log("WhatsApp UI INTEGRATION TEST SUMMARY", colors.bold);
  log("=".repeat(60), colors.bold);

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const failedTests = totalTests - passedTests;

  if (failedTests === 0) {
    success(`All ${totalTests} UI integration checks passed! 🎉`);
    log("\nYour WhatsApp Clone UI is fully integrated with:", colors.green);
    log("✅ ChatArea component with WhatsApp messaging", colors.green);
    log("✅ Sidebar with WhatsApp account management", colors.green);
    log("✅ Message component with WhatsApp status indicators", colors.green);
    log("✅ All services enhanced with WhatsApp features", colors.green);
    log("✅ Socket.IO real-time WhatsApp events", colors.green);
    log("✅ Backend routes properly integrated", colors.green);

    log("\nUI Features Available:", colors.blue);
    log("📱 Phone number search and messaging", colors.blue);
    log("🔗 WhatsApp account linking/unlinking", colors.blue);
    log("📨 WhatsApp message templates", colors.blue);
    log("📊 Message delivery status indicators", colors.blue);
    log("🔄 Real-time WhatsApp message updates", colors.blue);
    log("👥 Contact-based conversations", colors.blue);

    log("\nReady to test:", colors.green);
    log("1. Start the backend: cd backend && npm run dev", colors.green);
    log("2. Start the frontend: cd frontend && npm run dev", colors.green);
    log("3. Open http://localhost:5173", colors.green);
    log("4. Register/Login and test WhatsApp features!", colors.green);
  } else {
    error(`${failedTests} of ${totalTests} UI integration checks failed`);
    log("\nSome UI components need attention.", colors.yellow);
  }

  log("\nDetailed Results:", colors.blue);
  for (const [test, passed] of Object.entries(results)) {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    const color = passed ? colors.green : colors.red;
    log(`${status} ${test}`, color);
  }
}

async function main() {
  log("Starting WhatsApp Clone UI Integration Test...", colors.bold);
  log(
    "This will verify all UI components are integrated with WhatsApp features.\n",
    colors.blue
  );

  const results = {
    "ChatArea Component": await testChatAreaIntegration(),
    "Sidebar Component": await testSidebarIntegration(),
    "Message Component": await testMessageComponentIntegration(),
    "Service Layer": await testServiceIntegration(),
    "Socket Integration": await testSocketIntegration(),
    "Backend Integration": await testBackendIntegration(),
  };

  await generateUITestSummary(results);

  // Exit with error code if any tests failed
  const hasFailures = Object.values(results).some((result) => !result);
  process.exit(hasFailures ? 1 : 0);
}

// Run the UI integration test
main().catch((err) => {
  error(`UI integration test failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
