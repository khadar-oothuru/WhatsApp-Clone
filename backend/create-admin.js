import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/whatsapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin);
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: "admin",
      email: "admin@example.com",
      password: "admin123", // This will be hashed by the User model pre-save hook
      status: "I am the admin user",
    });

    await adminUser.save();
    console.log("Admin user created successfully:", {
      id: adminUser._id,
      username: adminUser.username,
      email: adminUser.email,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser();
