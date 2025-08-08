import express from "express";
import { User } from "../models/index.js";

const router = express.Router();

// Get current user profile (enhanced with WhatsApp data)
router.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Include WhatsApp specific fields in response
    const userResponse = {
      ...user.toObject(),
      whatsapp_connected: !!(user.wa_id || user.phone_number_id),
      whatsapp_name: user.profile?.name || user.username,
      phone_number: user.wa_id || user.phone_number,
    };

    res.json(userResponse);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all users (except current user) - enhanced with WhatsApp data
router.get("/", async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.id },
    }).select("-password");

    // Enhance users with WhatsApp information
    const enhancedUsers = users.map((user) => ({
      ...user.toObject(),
      whatsapp_connected: !!(user.wa_id || user.phone_number_id),
      whatsapp_name: user.profile?.name || user.username,
      phone_number: user.wa_id || user.phone_number,
    }));

    res.json(enhancedUsers);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Search users by phone number or name (NEW - WhatsApp specific)
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const currentUserId = req.user.id;

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: query, $options: "i" } },
        { "profile.name": { $regex: query, $options: "i" } },
        { wa_id: { $regex: query, $options: "i" } },
        { phone_number: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("-password")
      .limit(20);

    const enhancedUsers = users.map((user) => ({
      ...user.toObject(),
      whatsapp_connected: !!(user.wa_id || user.phone_number_id),
      whatsapp_name: user.profile?.name || user.username,
      phone_number: user.wa_id || user.phone_number,
    }));

    res.json(enhancedUsers);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user by phone number (NEW - WhatsApp specific)
router.get("/phone/:phoneNumber", async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;

    const user = await User.findOne({
      $or: [{ wa_id: phoneNumber }, { phone_number: phoneNumber }],
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userResponse = {
      ...user.toObject(),
      whatsapp_connected: !!(user.wa_id || user.phone_number_id),
      whatsapp_name: user.profile?.name || user.username,
      phone_number: user.wa_id || user.phone_number,
    };

    res.json(userResponse);
  } catch (error) {
    console.error("Get user by phone error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userResponse = {
      ...user.toObject(),
      whatsapp_connected: !!(user.wa_id || user.phone_number_id),
      whatsapp_name: user.profile?.name || user.username,
      phone_number: user.wa_id || user.phone_number,
    };

    res.json(userResponse);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user profile (enhanced with WhatsApp data)
router.put("/profile", async (req, res) => {
  try {
    const {
      status,
      profilePicture,
      username,
      whatsapp_name,
      phone_number,
      wa_id,
    } = req.body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (profilePicture !== undefined)
      updateData.profilePicture = profilePicture;
    if (username !== undefined) updateData.username = username;

    // WhatsApp specific updates
    if (whatsapp_name !== undefined) {
      updateData["profile.name"] = whatsapp_name;
    }
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (wa_id !== undefined) updateData.wa_id = wa_id;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userResponse = {
      ...user.toObject(),
      whatsapp_connected: !!(user.wa_id || user.phone_number_id),
      whatsapp_name: user.profile?.name || user.username,
      phone_number: user.wa_id || user.phone_number,
    };

    res.json(userResponse);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user online status
router.put("/status/online", async (req, res) => {
  try {
    const { isOnline } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        isOnline: isOnline,
        lastSeen: isOnline ? null : new Date(),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Update online status error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Link WhatsApp account (NEW)
router.post("/link-whatsapp", async (req, res) => {
  try {
    const { wa_id, phone_number_id, display_phone_number, profile_name } =
      req.body;

    if (!wa_id) {
      return res.status(400).json({ error: "WhatsApp ID is required" });
    }

    // Check if WhatsApp ID is already linked to another user
    const existingUser = await User.findOne({
      wa_id: wa_id,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "This WhatsApp number is already linked to another account",
      });
    }

    const updateData = {
      wa_id,
      phone_number_id,
      display_phone_number,
      "profile.name": profile_name || undefined,
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    const userResponse = {
      ...user.toObject(),
      whatsapp_connected: true,
      whatsapp_name: user.profile?.name || user.username,
      phone_number: user.wa_id || user.phone_number,
    };

    res.json({
      message: "WhatsApp account linked successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Link WhatsApp error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Unlink WhatsApp account (NEW)
router.post("/unlink-whatsapp", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $unset: {
          wa_id: 1,
          phone_number_id: 1,
          display_phone_number: 1,
          business_account_id: 1,
          app_id: 1,
        },
      },
      { new: true }
    ).select("-password");

    const userResponse = {
      ...user.toObject(),
      whatsapp_connected: false,
      whatsapp_name: user.profile?.name || user.username,
      phone_number: user.phone_number,
    };

    res.json({
      message: "WhatsApp account unlinked successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Unlink WhatsApp error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
