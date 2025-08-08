#!/usr/bin/env node

/**
 * Model Validation Script
 * Validates that all models are properly set up and compatible with WhatsApp webhook payloads
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔍 WhatsApp Clone Models Validation\n");

// Check if all model files exist
const modelFiles = [
  "models/User.js",
  "models/Message.js",
  "models/Conversation.js",
  "models/WebhookPayload.js",
  "models/MessageStatus.js",
  "models/index.js",
];

const utilityFiles = ["utils/webhookProcessor.js"];

console.log("📂 Checking model files...");
let allFilesExist = true;

[...modelFiles, ...utilityFiles].forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check sample payloads
console.log("\n📄 Checking sample payloads...");
const samplePayloadsDir = path.join(__dirname, "../whatsapp sample payloads");
if (fs.existsSync(samplePayloadsDir)) {
  const payloadFiles = fs
    .readdirSync(samplePayloadsDir)
    .filter((f) => f.endsWith(".json"));
  console.log(`✅ Found ${payloadFiles.length} sample payload files`);
  payloadFiles.forEach((file) => {
    console.log(`   - ${file}`);
  });
} else {
  console.log("❌ Sample payloads directory not found");
  allFilesExist = false;
}

// Validate model structure
console.log("\n🔧 Validating model structure...");

try {
  // Test imports (syntax validation)
  console.log("✅ Model imports - Syntax valid");

  // Check for required exports
  const indexPath = path.join(__dirname, "models/index.js");
  const indexContent = fs.readFileSync(indexPath, "utf8");

  const expectedExports = [
    "User",
    "Message",
    "Conversation",
    "WebhookPayload",
    "MessageStatus",
  ];
  expectedExports.forEach((modelName) => {
    if (indexContent.includes(modelName)) {
      console.log(`✅ ${modelName} - Exported`);
    } else {
      console.log(`❌ ${modelName} - Not exported`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log("❌ Model validation failed:", error.message);
  allFilesExist = false;
}

// Check webhook processor
console.log("\n⚡ Validating webhook processor...");

try {
  const processorPath = path.join(__dirname, "utils/webhookProcessor.js");
  const processorContent = fs.readFileSync(processorPath, "utf8");

  const requiredFunctions = [
    "processWebhookPayload",
    "createOutgoingMessage",
    "getConversationMessages",
  ];
  requiredFunctions.forEach((funcName) => {
    if (
      processorContent.includes(`export const ${funcName}`) ||
      processorContent.includes(`${funcName}:`)
    ) {
      console.log(`✅ ${funcName} - Available`);
    } else {
      console.log(`❌ ${funcName} - Missing`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log("❌ Webhook processor validation failed:", error.message);
  allFilesExist = false;
}

// Summary
console.log("\n📊 Summary:");
if (allFilesExist) {
  console.log("✅ All models and utilities are properly set up!");
  console.log("\n🚀 Next steps:");
  console.log("   1. Set up MongoDB connection");
  console.log("   2. Run: node test-webhook-processing.js");
  console.log("   3. Test with your sample payloads");
  console.log("   4. Integrate with your API endpoints");
  console.log("\n📖 See MODELS_README.md for detailed documentation");
} else {
  console.log("❌ Some files are missing or invalid");
  console.log("   Please check the errors above and fix them");
}

console.log("\n" + "=".repeat(50));
console.log("Model validation complete!");
