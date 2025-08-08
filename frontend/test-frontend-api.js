// Test script to check frontend authentication and API calls
// Open browser console and paste this to debug

const testFrontendAPI = async () => {
  console.log("=== Frontend API Test ===");

  // Check if we have auth data
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  console.log("Token exists:", !!token);
  console.log("User data exists:", !!userStr);

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log("Current user:", {
        id: user._id,
        username: user.username,
        email: user.email,
      });
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }

  if (token) {
    try {
      console.log("\n--- Testing Users API ---");
      const usersResponse = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (usersResponse.ok) {
        const users = await usersResponse.json();
        console.log("Users API response:", users.length, "users found");
        users.forEach((user, i) => {
          console.log(`User ${i + 1}:`, user.username, user.email);
        });
      } else {
        console.error(
          "Users API error:",
          usersResponse.status,
          await usersResponse.text()
        );
      }

      console.log("\n--- Testing Conversations API ---");
      const conversationsResponse = await fetch(
        "http://localhost:5000/api/messages/conversations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (conversationsResponse.ok) {
        const conversations = await conversationsResponse.json();
        console.log(
          "Conversations API response:",
          conversations.length,
          "conversations found"
        );
        conversations.forEach((conv, i) => {
          console.log(
            `Conversation ${i + 1}:`,
            conv.user?.username || "No user"
          );
        });
      } else {
        console.error(
          "Conversations API error:",
          conversationsResponse.status,
          await conversationsResponse.text()
        );
      }
    } catch (error) {
      console.error("API test error:", error);
    }
  } else {
    console.log("No token found - user not authenticated");
  }
};

// Auto-run the test
testFrontendAPI();
