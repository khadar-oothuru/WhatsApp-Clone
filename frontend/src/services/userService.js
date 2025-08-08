import api from "./authService";

export const userService = {
  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (error) {
      console.error("UserService: Get current user error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to fetch current user"
      );
    }
  },

  // Get all users (except current user)
  async getUsers() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await api.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // FIXED: Ensure we return an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      // FIXED: Better error handling
      if (error.response?.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      if (error.response?.status === 403) {
        throw new Error("Access forbidden");
      }

      throw new Error(error.response?.data?.error || "Failed to fetch users");
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }

      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("UserService: Get user by ID error:", error);

      // FIXED: Better error handling for specific cases
      if (error.response?.status === 404) {
        throw new Error("User not found");
      }
      if (error.response?.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }

      throw new Error(error.response?.data?.error || "Failed to fetch user");
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      if (!profileData) {
        throw new Error("Profile data is required");
      }

      const response = await api.put("/users/profile", profileData);

      // FIXED: Better localStorage handling with error checking
      try {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (storageError) {
        console.warn("Failed to update localStorage:", storageError);
      }

      return response.data;
    } catch (error) {
      console.error("UserService: Update profile error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update profile"
      );
    }
  },

  // Update user online status
  async updateOnlineStatus(isOnline = true) {
    try {
      const response = await api.put("/users/status/online", { isOnline });

      // FIXED: Better localStorage handling
      try {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          isOnline,
          lastSeen: new Date().toISOString(),
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (storageError) {
        console.warn("Failed to update localStorage:", storageError);
      }

      return response.data;
    } catch (error) {
      console.error("UserService: Update online status error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update online status"
      );
    }
  },

  // Search users
  async searchUsers(query) {
    try {
      // FIXED: Better input validation
      if (!query || typeof query !== "string" || query.trim().length < 2) {
        return [];
      }

      const trimmedQuery = query.trim();
      const response = await api.get(
        `/users/search/${encodeURIComponent(trimmedQuery)}`
      );

      // FIXED: Ensure we return an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("UserService: Search users error:", error);

      // FIXED: Don't throw for search errors, just return empty array
      if (error.response?.status === 404) {
        return [];
      }

      throw new Error(error.response?.data?.error || "Failed to search users");
    }
  },

  // Update user profile picture
  async updateProfilePicture(imageFile) {
    try {
      if (!imageFile) {
        throw new Error("Image file is required");
      }

      // FIXED: Validate file type and size
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(imageFile.type)) {
        throw new Error(
          "Invalid file type. Please upload a JPEG, PNG, or WebP image."
        );
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imageFile.size > maxSize) {
        throw new Error("File size too large. Maximum size is 5MB.");
      }

      const formData = new FormData();
      formData.append("profilePicture", imageFile);

      const response = await api.put("/users/profile/picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // FIXED: Better localStorage handling
      try {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          profilePicture: response.data.profilePicture,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (storageError) {
        console.warn("Failed to update localStorage:", storageError);
      }

      return response.data;
    } catch (error) {
      console.error("UserService: Update profile picture error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update profile picture"
      );
    }
  },

  // Block/Unblock user
  async blockUser(userId, block = true) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const response = await api.put(`/users/${userId}/block`, {
        blocked: block,
      });
      return response.data;
    } catch (error) {
      console.error("UserService: Block user error:", error);
      throw new Error(error.response?.data?.error || "Failed to block user");
    }
  },

  // Get blocked users
  async getBlockedUsers() {
    try {
      const response = await api.get("/users/blocked");
      // FIXED: Ensure we return an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("UserService: Get blocked users error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to fetch blocked users"
      );
    }
  },

  // Report user
  async reportUser(userId, reason) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
        throw new Error("Reason must be at least 5 characters long");
      }

      const response = await api.post(`/users/${userId}/report`, {
        reason: reason.trim(),
      });
      return response.data;
    } catch (error) {
      console.error("UserService: Report user error:", error);
      throw new Error(error.response?.data?.error || "Failed to report user");
    }
  },

  // Get user activity status
  async getUserActivity(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const response = await api.get(`/users/${userId}/activity`);
      return response.data;
    } catch (error) {
      console.error("UserService: Get user activity error:", error);

      // FIXED: Handle 404 case gracefully
      if (error.response?.status === 404) {
        return { isOnline: false, lastSeen: null };
      }

      throw new Error(
        error.response?.data?.error || "Failed to fetch user activity"
      );
    }
  },

  // Update user settings/preferences
  async updateSettings(settings) {
    try {
      if (!settings || typeof settings !== "object") {
        throw new Error("Settings object is required");
      }

      const response = await api.put("/users/settings", settings);

      // FIXED: Better localStorage handling with validation
      try {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          settings: {
            ...currentUser.settings,
            ...settings,
          },
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (storageError) {
        console.warn("Failed to update localStorage:", storageError);
      }

      return response.data;
    } catch (error) {
      console.error("UserService: Update settings error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update settings"
      );
    }
  },

  // FIXED: Add new helper methods for better error handling and caching

  // Clear user cache (useful after logout)
  clearCache() {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("userSettings");
    } catch (error) {
      console.warn("Failed to clear user cache:", error);
    }
  },

  // Get cached user data
  getCachedUser() {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn("Failed to get cached user:", error);
      return null;
    }
  },

  // Validate user data before API calls
  validateUserData(userData) {
    if (!userData) return false;

    const requiredFields = ["username", "email"];
    return requiredFields.every(
      (field) => userData[field] && typeof userData[field] === "string"
    );
  },

  // FIXED: Add retry mechanism for critical operations
  async getUserWithRetry(userId, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.getUserById(userId);
      } catch (error) {
        lastError = error;

        // Don't retry on 404 or 401 errors
        if (
          error.message.includes("not found") ||
          error.message.includes("Unauthorized")
        ) {
          throw error;
        }

        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError;
  },

  // FIXED: Add method to refresh user token if needed
  async refreshUserData() {
    try {
      const currentUser = await this.getCurrentUser();

      // Update localStorage with fresh data
      localStorage.setItem("user", JSON.stringify(currentUser));

      return currentUser;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      throw error;
    }
  },

  // ============ WhatsApp Integration Methods ============

  // Link WhatsApp account to current user
  async linkWhatsAppAccount(whatsappData) {
    try {
      if (!whatsappData || !whatsappData.wa_id || !whatsappData.phone_number) {
        throw new Error("WhatsApp ID and phone number are required");
      }

      const response = await api.post("/users/link-whatsapp", whatsappData);

      // Update localStorage with WhatsApp data
      try {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          wa_id: response.data.wa_id,
          phone_number: response.data.phone_number,
          phone_number_id: response.data.phone_number_id,
          whatsapp_name: response.data.whatsapp_name,
          profile: {
            ...currentUser.profile,
            ...response.data.profile,
          },
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (storageError) {
        console.warn(
          "Failed to update localStorage with WhatsApp data:",
          storageError
        );
      }

      return response.data;
    } catch (error) {
      console.error("UserService: Link WhatsApp account error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to link WhatsApp account"
      );
    }
  },

  // Unlink WhatsApp account from current user
  async unlinkWhatsAppAccount() {
    try {
      const response = await api.post("/users/unlink-whatsapp");

      // Remove WhatsApp data from localStorage
      try {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          wa_id: null,
          phone_number: null,
          phone_number_id: null,
          whatsapp_name: null,
          profile: {
            ...currentUser.profile,
            whatsapp_business_account_id: null,
          },
        };
        delete updatedUser.wa_id;
        delete updatedUser.phone_number;
        delete updatedUser.phone_number_id;
        delete updatedUser.whatsapp_name;

        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (storageError) {
        console.warn(
          "Failed to update localStorage after unlinking:",
          storageError
        );
      }

      return response.data;
    } catch (error) {
      console.error("UserService: Unlink WhatsApp account error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to unlink WhatsApp account"
      );
    }
  },

  // Find user by phone number
  async getUserByPhone(phoneNumber) {
    try {
      if (!phoneNumber || typeof phoneNumber !== "string") {
        throw new Error("Valid phone number is required");
      }

      // Clean phone number (remove non-digits)
      const cleanedPhone = phoneNumber.replace(/\D/g, "");
      if (cleanedPhone.length < 10) {
        throw new Error("Phone number must be at least 10 digits");
      }

      const response = await api.get(
        `/users/phone/${encodeURIComponent(cleanedPhone)}`
      );
      return response.data;
    } catch (error) {
      console.error("UserService: Get user by phone error:", error);

      if (error.response?.status === 404) {
        return null; // User not found by phone number
      }

      throw new Error(
        error.response?.data?.error || "Failed to find user by phone number"
      );
    }
  },

  // Search users by phone number
  async searchUsersByPhone(phoneQuery) {
    try {
      if (
        !phoneQuery ||
        typeof phoneQuery !== "string" ||
        phoneQuery.trim().length < 3
      ) {
        return [];
      }

      // Clean phone query
      const cleanedQuery = phoneQuery.replace(/\D/g, "");
      if (cleanedQuery.length < 3) {
        return [];
      }

      const response = await api.get(
        `/users/search/phone/${encodeURIComponent(cleanedQuery)}`
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("UserService: Search users by phone error:", error);

      // Don't throw for search errors, just return empty array
      if (error.response?.status === 404) {
        return [];
      }

      return [];
    }
  },

  // Check if current user has WhatsApp linked
  isWhatsAppLinked() {
    try {
      const currentUser = this.getCachedUser();
      return !!(currentUser?.wa_id || currentUser?.phone_number);
    } catch (error) {
      console.warn("Failed to check WhatsApp link status:", error);
      return false;
    }
  },

  // Get WhatsApp profile info
  getWhatsAppProfile() {
    try {
      const currentUser = this.getCachedUser();
      if (!currentUser?.wa_id) {
        return null;
      }

      return {
        wa_id: currentUser.wa_id,
        phone_number: currentUser.phone_number,
        phone_number_id: currentUser.phone_number_id,
        whatsapp_name: currentUser.whatsapp_name,
        display_phone: currentUser.phone_number
          ? `+${currentUser.phone_number}`
          : null,
        business_account_id: currentUser.profile?.whatsapp_business_account_id,
        is_business: !!currentUser.profile?.whatsapp_business_account_id,
      };
    } catch (error) {
      console.warn("Failed to get WhatsApp profile:", error);
      return null;
    }
  },

  // Validate phone number format for WhatsApp
  validatePhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== "string") {
      return { valid: false, error: "Phone number is required" };
    }

    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Check if it's a valid international format
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      return {
        valid: true,
        formatted: cleaned,
        display: `+${cleaned}`,
      };
    }

    return {
      valid: false,
      error:
        "Invalid phone number format. Please use international format (e.g., +1234567890)",
    };
  },
};
