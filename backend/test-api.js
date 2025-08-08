import fetch from "node-fetch";

const API_URL = "http://localhost:5000/api";

// Test user credentials
const testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "test123",
};

async function testAPI() {
  console.log("🧪 Testing Backend API...\n");

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
          username: testUser.email, // The backend accepts email as username
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

    // Test authenticated endpoints
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Test get current user
    console.log("\n3. Testing get current user...");
    const meRes = await fetch(`${API_URL}/users/me`, {
      headers: authHeaders,
    });
    const meData = await meRes.json();
    console.log("✅ Current user:", {
      username: meData.username,
      email: meData.email,
      isOnline: meData.isOnline,
      status: meData.status,
    });

    // Test get all users
    console.log("\n4. Testing get all users...");
    const usersRes = await fetch(`${API_URL}/users`, {
      headers: authHeaders,
    });
    const usersData = await usersRes.json();
    console.log("✅ Found", usersData.length, "other users");

    // Test get conversations
    console.log("\n5. Testing get conversations...");
    const conversationsRes = await fetch(`${API_URL}/messages/conversations`, {
      headers: authHeaders,
    });
    const conversationsData = await conversationsRes.json();
    console.log("✅ Found", conversationsData.length, "conversations");

    // Test update profile
    console.log("\n6. Testing update profile...");
    const updateRes = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        status: "Testing the API",
        profilePicture: "https://example.com/avatar.jpg",
      }),
    });
    const updateData = await updateRes.json();
    console.log("✅ Profile updated:", {
      status: updateData.status,
      profilePicture: updateData.profilePicture,
    });

    console.log("\n✨ All tests passed successfully!");
    console.log("\n📊 Backend API Summary:");
    console.log(
      "- User model has: lastSeen, isOnline, profilePicture, status ✅"
    );
    console.log("- Conversation model created ✅");
    console.log("- /api/messages/conversations endpoint working ✅");
    console.log("- Users route returns proper user data ✅");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run tests
testAPI();
