// Debug Authentication Flow
// Run this in the browser console to see what's happening

console.log("=== DEBUGGING AUTHENTICATION ===");

// Check localStorage
console.log("1. Checking localStorage:");
console.log(
  "  - Token:",
  localStorage.getItem("token") ? "Present" : "Not found"
);
console.log(
  "  - User:",
  localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : "Not found"
);

// Check current page
console.log("2. Current page:", window.location.pathname);

// Test backend connection
console.log("3. Testing backend connection...");
fetch("http://localhost:5000/health")
  .then((response) => response.json())
  .then((data) => {
    console.log("  - Health check:", data);

    // Test authenticated endpoints
    const token = localStorage.getItem("token");
    if (token) {
      console.log("4. Testing authenticated endpoints with token...");

      // Test users endpoint
      fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          console.log("  - Users endpoint status:", response.status);
          return response.json();
        })
        .then((data) => {
          console.log("  - Users data:", data);
        })
        .catch((error) => {
          console.error("  - Users endpoint error:", error);
        });

      // Test conversations endpoint
      fetch("http://localhost:5000/api/messages/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          console.log("  - Conversations endpoint status:", response.status);
          return response.json();
        })
        .then((data) => {
          console.log("  - Conversations data:", data);
        })
        .catch((error) => {
          console.error("  - Conversations endpoint error:", error);
        });
    } else {
      console.log("4. No token found, skipping authenticated endpoint tests");
    }
  })
  .catch((error) => {
    console.error("  - Health check failed:", error);
  });

console.log("=== END DEBUG ===");
