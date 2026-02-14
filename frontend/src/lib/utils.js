// Format message timestamp
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  // Less than 1 minute
  if (diffInMinutes < 1) {
    return "Just now";
  }

  // Less than 1 hour
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  // Less than 24 hours
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  // Less than 7 days
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // More than 7 days - show date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

// Format time for display (HH:MM AM/PM)
export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Format date for display
export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Get relative time (e.g., "2 hours ago", "Yesterday", etc.)
export const getRelativeTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? "s" : ""} ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? "s" : ""} ago`;
};
