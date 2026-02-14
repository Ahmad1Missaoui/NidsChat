/**
 * Chat utility functions
 * Provides helpers for formatting, background selection, and message processing
 */

const BACKGROUND_IMAGES = [
  '/conversations/img1.jpg',
  '/conversations/img2.jpg',
  '/conversations/img3.jpg',
  '/conversations/img4.jpg',
];

/**
 * Format message timestamp for display
 * @param {string|Date} timestamp 
 * @returns {string} Formatted time string
 */
export const formatMessageTime = (timestamp) => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const isToday = messageDate.toDateString() === today.toDateString();
  
  const timeString = messageDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  if (isToday) {
    return timeString;
  }
  
  return messageDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  }) + " • " + timeString;
};

/**
 * Get deterministic background image for a chat
 * Uses chat ID to ensure same background always
 * @param {string} chatId 
 * @returns {string} Background image URL
 */
export const getChatBackground = (chatId) => {
  if (!chatId) return BACKGROUND_IMAGES[0];
  
  // Simple hash function for deterministic selection
  let hash = 0;
  for (let i = 0; i < chatId.length; i++) {
    hash = ((hash << 5) - hash) + chatId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % BACKGROUND_IMAGES.length;
  return BACKGROUND_IMAGES[index];
};

/**
 * Format audio duration
 * @param {number} seconds 
 * @returns {string} Formatted duration MM:SS
 */
export const formatDuration = (seconds) => {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return "0:00";
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Check if user is admin in a group
 * @param {Object} group 
 * @param {string} userId 
 * @returns {boolean}
 */
export const isUserAdmin = (group, userId) => {
  if (!group || !userId) return false;
  
  const isInAdmins = group.admins?.some((admin) => 
    typeof admin === 'string' ? admin === userId : admin._id === userId
  );
  
  const isMainAdmin = 
    (typeof group.admin === 'string' ? group.admin === userId : group.admin?._id === userId);
  
  return isInAdmins || isMainAdmin;
};

/**
 * Check if message is from current user
 * @param {Object} message 
 * @param {string} userId 
 * @param {boolean} isGroupChat 
 * @returns {boolean}
 */
export const isMessageFromUser = (message, userId, isGroupChat) => {
  return isGroupChat 
    ? (message.sender?._id === userId) 
    : (message.senderId === userId);
};
