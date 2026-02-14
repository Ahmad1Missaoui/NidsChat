import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useFriendStore = create((set, get) => ({
  friends: [],
  friendRequests: [],
  sentRequests: [],
  blockedUsers: [],
  friendshipStatusByUser: {},
  isLoadingFriends: false,
  isLoadingRequests: false,
  unreadRequestsCount: 0,

  // Fetch friends list
  getFriends: async () => {
    set({ isLoadingFriends: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({ friends: res.data });
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error(error.response?.data?.message || "Failed to load friends");
    } finally {
      set({ isLoadingFriends: false });
    }
  },

  // Fetch friend requests
  getFriendRequests: async () => {
    set({ isLoadingRequests: true });
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ 
        friendRequests: res.data,
        unreadRequestsCount: res.data.length 
      });
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    } finally {
      set({ isLoadingRequests: false });
    }
  },

  // Send friend request
  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/request/${userId}`);
      toast.success("Friend request sent!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
      return false;
    }
  },

  // Accept friend request
  acceptFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/accept/${userId}`);
      toast.success("Friend request accepted!");
      get().getFriends();
      get().getFriendRequests();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
      return false;
    }
  },

  // Reject friend request
  rejectFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/reject/${userId}`);
      toast.success("Friend request rejected");
      get().getFriendRequests();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
      return false;
    }
  },

  // Remove friend
  removeFriend: async (friendId) => {
    try {
      await axiosInstance.delete(`/friends/${friendId}`);
      toast.success("Friend removed");
      get().getFriends();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove friend");
      return false;
    }
  },

  // Block user
  blockUser: async (userId) => {
    try {
      await axiosInstance.post(`/friends/block/${userId}`);
      toast.success("User blocked");
      // No need to refresh friends list - friendship is maintained
      // Clear cached friendship status to force re-check
      const statusCache = get().friendshipStatusByUser;
      delete statusCache[userId];
      set({ friendshipStatusByUser: { ...statusCache } });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block user");
      return false;
    }
  },

  // Unblock user
  unblockUser: async (userId) => {
    try {
      await axiosInstance.post(`/friends/unblock/${userId}`);
      toast.success("User unblocked");
      get().getBlockedUsers();
      // No need to refresh friends list - friendship was never removed
      // Clear cached friendship status to force re-check
      const statusCache = get().friendshipStatusByUser;
      delete statusCache[userId];
      set({ friendshipStatusByUser: { ...statusCache } });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unblock user");
      return false;
    }
  },

  // Get blocked users
  getBlockedUsers: async () => {
    try {
      const res = await axiosInstance.get("/friends/blocked");
      set({ blockedUsers: res.data });
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    }
  },

  // Check friendship status
  checkFriendship: async (userId) => {
    try {
      const res = await axiosInstance.get(`/friends/check/${userId}`);
      set({
        friendshipStatusByUser: {
          ...get().friendshipStatusByUser,
          [userId]: res.data,
        },
      });
      return res.data;
    } catch (error) {
      console.error("Error checking friendship:", error);
      return null;
    }
  },

  // Update privacy settings
  updatePrivacySettings: async (settings) => {
    try {
      await axiosInstance.put("/friends/privacy", settings);
      toast.success("Privacy settings updated");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
      return false;
    }
  },

  // Add new friend request (from socket)
  addFriendRequest: (request) => {
    set((state) => ({
      friendRequests: [request, ...state.friendRequests],
      unreadRequestsCount: state.unreadRequestsCount + 1,
    }));
  },

  // Remove friend request (after accept/reject)
  removeFriendRequest: (userId) => {
    set((state) => ({
      friendRequests: state.friendRequests.filter((req) => req._id !== userId),
      unreadRequestsCount: Math.max(0, state.unreadRequestsCount - 1),
    }));
  },

  // Clear unread count
  clearUnreadRequests: () => {
    set({ unreadRequestsCount: 0 });
  },
}));
