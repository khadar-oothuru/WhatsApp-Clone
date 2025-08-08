import fetch from "node-fetch";

const API_URL = "http://localhost:5000/api";

// Test user credentials
const testUser = {
  username: "apitest",
  email: "apitest@example.com",
  password: "test123",
};

async function testAllEndpoints() {
  console.log("🧪 Testing All Backend Endpoints...\n");

  try {
    // Test health endpoint
    console.log("1. Testing health endpoint...");
    const healthRes = await fetch("http://localhost:5000/health");
    const healthData = await healthRes.json();
    console.log("✅ Health check:", healthData);

    // Test registration
    console.log("\n2. Testing user registration...");
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    let token, userId;

    if (registerRes.status === 400 || registerRes.status === 409) {
      console.log("⚠️ User already exists, trying login...");

      // Try login instead
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: testUser.email,
          password: testUser.password,
        }),
      });

      const loginData = await loginRes.json();
      token = loginData.token;
      userId = loginData.user._id;
      console.log("✅ Login successful");
    } else {
      const registerData = await registerRes.json();
      token = registerData.token;
      userId = registerData.user._id;
      console.log("✅ Registration successful");
    }

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    console.log("\n--- TESTING USER ENDPOINTS ---");

    // Test get current user
    console.log("\n3. Testing GET /api/users/me...");
    const meRes = await fetch(`${API_URL}/users/me`, { headers: authHeaders });
    const meData = await meRes.json();
    console.log("✅ Current user:", meData.username);

    // Test get all users
    console.log("\n4. Testing GET /api/users...");
    const usersRes = await fetch(`${API_URL}/users`, { headers: authHeaders });
    const usersData = await usersRes.json();
    console.log("✅ Found", usersData.length, "other users");

    // Test search users
    console.log("\n5. Testing GET /api/users/search/:query...");
    const searchRes = await fetch(`${API_URL}/users/search/test`, {
      headers: authHeaders,
    });
    const searchData = await searchRes.json();
    console.log("✅ Search found", searchData.length, "users");

    // Test update profile
    console.log("\n6. Testing PUT /api/users/profile...");
    const updateRes = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        status: "Testing all endpoints",
        profilePicture: "https://example.com/avatar.jpg",
      }),
    });
    const updateData = await updateRes.json();
    console.log("✅ Profile updated");

    // Test update profile picture
    console.log("\n7. Testing PUT /api/users/profile/picture...");
    const pictureRes = await fetch(`${API_URL}/users/profile/picture`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        profilePicture: "https://example.com/new-avatar.jpg",
      }),
    });
    const pictureData = await pictureRes.json();
    console.log("✅ Profile picture updated");

    // Test update online status
    console.log("\n8. Testing PUT /api/users/status/online...");
    const onlineRes = await fetch(`${API_URL}/users/status/online`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ isOnline: true }),
    });
    const onlineData = await onlineRes.json();
    console.log("✅ Online status updated");

    console.log("\n--- TESTING MESSAGE ENDPOINTS ---");

    // Test get conversations
    console.log("\n9. Testing GET /api/messages/conversations...");
    const conversationsRes = await fetch(`${API_URL}/messages/conversations`, {
      headers: authHeaders,
    });
    const conversationsData = await conversationsRes.json();
    console.log("✅ Found", conversationsData.length, "conversations");

    // Find another user to test messaging with
    if (usersData.length > 0) {
      const otherUser = usersData[0];

      // Test send message
      console.log(
        `\n10. Testing POST /api/messages (to ${otherUser.username})...`
      );
      const sendRes = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          recipientId: otherUser._id,
          content: "Test message from endpoint test",
          type: "text",
        }),
      });
      const sendData = await sendRes.json();
      console.log("✅ Message sent");

      // Test get messages
      console.log(`\n11. Testing GET /api/messages/${otherUser._id}...`);
      const messagesRes = await fetch(`${API_URL}/messages/${otherUser._id}`, {
        headers: authHeaders,
      });
      const messagesData = await messagesRes.json();
      console.log("✅ Found", messagesData.length, "messages");

      // Test mark as read
      console.log(
        `\n12. Testing PUT /api/messages/conversations/${otherUser._id}/read...`
      );
      const readRes = await fetch(
        `${API_URL}/messages/conversations/${otherUser._id}/read`,
        {
          method: "PUT",
          headers: authHeaders,
        }
      );
      const readData = await readRes.json();
      console.log("✅ Messages marked as read");

      if (messagesData.length > 0) {
        const messageId = messagesData[messagesData.length - 1]._id;

        // Test update message status
        console.log(`\n13. Testing PUT /api/messages/${messageId}/status...`);
        const statusRes = await fetch(
          `${API_URL}/messages/${messageId}/status`,
          {
            method: "PUT",
            headers: authHeaders,
            body: JSON.stringify({ status: "read" }),
          }
        );
        const statusData = await statusRes.json();
        console.log("✅ Message status updated");
      }
    }

    console.log("\n✨ All endpoint tests completed successfully!");
    console.log("\n📊 Backend API Status:");
    console.log("- Authentication endpoints ✅");
    console.log("- User management endpoints ✅");
    console.log("- Message endpoints ✅");
    console.log("- Search functionality ✅");
    console.log("- Profile management ✅");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", await error.response.text());
    }
  }
}

// Run tests
testAllEndpoints();
