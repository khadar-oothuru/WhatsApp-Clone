import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const users = await User.find().select("-password");
    console.log("Total users in database:", users.length);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        id: user._id,
        username: user.username,
        email: user.email,
        status: user.status || "No status",
        createdAt: user.createdAt,
      });
    });

    mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    mongoose.disconnect();
  }
};

checkUsers();
