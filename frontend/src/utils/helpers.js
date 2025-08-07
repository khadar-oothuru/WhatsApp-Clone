import { format, isToday, isYesterday, parseISO } from "date-fns";

/**
 * Format timestamp for chat messages
 * @param {string|Date} timestamp
 * @returns {string}
 */
export const formatMessageTime = (timestamp) => {
  try {
    if (!timestamp) return "";
    const date =
      typeof timestamp === "string" ? parseISO(timestamp) : new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return format(date, "HH:mm");
  } catch (error) {
    console.warn("Invalid timestamp for formatMessageTime:", timestamp, error);
    return "";
  }
};

/**
 * Format timestamp for last seen
 * @param {string|Date} timestamp
 * @returns {string}
 */
export const formatLastSeen = (timestamp) => {
  try {
    if (!timestamp) return "Never";

    const date =
      typeof timestamp === "string" ? parseISO(timestamp) : new Date(timestamp);
    if (isNaN(date.getTime())) return "Never";

    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hour${
        Math.floor(diffInMinutes / 60) > 1 ? "s" : ""
      } ago`;

    if (isToday(date)) return `today at ${format(date, "HH:mm")}`;
    if (isYesterday(date)) return `yesterday at ${format(date, "HH:mm")}`;

    return format(date, "dd/MM/yyyy HH:mm");
  } catch (error) {
    console.warn("Invalid timestamp for formatLastSeen:", timestamp, error);
    return "Never";
  }
};

/**
 * Format date for message grouping
 * @param {string|Date} timestamp
 * @returns {string}
 */
export const formatMessageDate = (timestamp) => {
  try {
    if (!timestamp) return "";

    let date;
    if (typeof timestamp === "string") {
      // Handle different string formats
      if (timestamp.includes("T") || timestamp.includes("Z")) {
        // ISO string
        date = parseISO(timestamp);
      } else if (
        /^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{4}$/.test(timestamp.trim())
      ) {
        // String from toDateString(), e.g., 'Thu Aug 07 2025'
        // This is a valid date string for JS Date
        date = new Date(timestamp);
      } else {
        // Try parsing as a fallback
        date = new Date(timestamp);
      }
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) {
      // Only warn if the string is not a valid toDateString format and not empty
      if (
        timestamp !== undefined &&
        timestamp !== null &&
        String(timestamp).trim() !== "" &&
        !/^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{4}$/.test(String(timestamp).trim())
      ) {
        console.warn("Invalid date for formatMessageDate:", timestamp);
      }
      return "";
    }

    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";

    return format(date, "dd/MM/yyyy");
  } catch (error) {
    console.warn("Error formatting message date:", timestamp, error);
    return "";
  }
};

/**
 * Check if user is online
 * @param {Array} onlineUsers
 * @param {string} userId
 * @returns {boolean}
 */
export const isUserOnline = (onlineUsers, userId) => {
  return onlineUsers && onlineUsers.includes(userId);
};

/**
 * Generate avatar placeholder color based on username
 * @param {string} username
 * @returns {string}
 */
export const getAvatarColor = (username) => {
  if (!username) return "#6b7280";

  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];

  const hash = username
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * Scroll to bottom of element smoothly
 * @param {HTMLElement} element
 */
export const scrollToBottom = (element) => {
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "end" });
  }
};

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Debounce function for search and typing indicators
 * @param {Function} func
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Check if two dates are the same day
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
export const isSameDay = (date1, date2) => {
  return date1.toDateString() === date2.toDateString();
};

/**
 * Group messages by date
 * @param {Array} messages
 * @returns {Array}
 */
export const groupMessagesByDate = (messages) => {
  if (!messages || messages.length === 0) return [];

  const grouped = [];
  let currentDate = null;
  let currentGroup = [];

  messages.forEach((message) => {
    try {
      const messageDate = new Date(message.createdAt);
      if (isNaN(messageDate.getTime())) {
        console.warn("Invalid message date:", message.createdAt);
        return;
      }

      const messageDateString = messageDate.toDateString();

      if (messageDateString !== currentDate) {
        if (currentGroup.length > 0) {
          grouped.push({
            date: currentDate,
            messages: currentGroup,
          });
        }
        currentDate = messageDateString;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    } catch (error) {
      console.warn("Error processing message date:", message, error);
    }
  });

  if (currentGroup.length > 0) {
    grouped.push({
      date: currentDate,
      messages: currentGroup,
    });
  }

  return grouped;
};
