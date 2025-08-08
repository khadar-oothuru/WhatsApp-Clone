// Simple test to verify backend connection
const testBackend = async () => {
  console.log("Testing backend connection...");

  try {
    // Test health endpoint
    const healthResponse = await fetch("http://localhost:5000/health");
    const healthData = await healthResponse.json();
    console.log("Health check:", healthData);

    // Test API endpoints that require auth (should return 401)
    const usersResponse = await fetch("http://localhost:5000/api/users");
    console.log(
      "Users endpoint (no auth):",
      usersResponse.status,
      usersResponse.statusText
    );

    const messagesResponse = await fetch(
      "http://localhost:5000/api/messages/conversations"
    );
    console.log(
      "Messages endpoint (no auth):",
      messagesResponse.status,
      messagesResponse.statusText
    );

    console.log("Backend is working correctly!");
  } catch (error) {
    console.error("Backend test failed:", error);
  }
};

testBackend();
