// Simple test to check frontend authentication
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

console.log("Current token:", token);
console.log("Current user:", user);
console.log("Is token valid?", !!token);

if (token) {
  // Test API call
  fetch("http://localhost:5000/api/messages/conversations", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      console.log("Response status:", response.status);
      return response.json();
    })
    .then((data) => {
      console.log("API Response:", data);
    })
    .catch((error) => {
      console.error("API Error:", error);
    });
} else {
  console.log("No token found - user needs to log in");
}
