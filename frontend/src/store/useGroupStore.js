import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  groupMessages: [],
  isLoading: false,
  isCreating: false,
  isSendingMessage: false,

  // Create a new group
  createGroup: async (groupData) => {
    set({ isCreating: true });
    try {
      const res = await axiosInstance.post("/groups", groupData);
      set((state) => ({
        groups: [res.data, ...state.groups],
        isCreating: false,
      }));
      toast.success("Group created successfully!");
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create group";
      toast.error(message);
      set({ isCreating: false });
      return null;
    }
  },

  // Get all groups for current user
  getGroups: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data, isLoading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
      set({ isLoading: false });
    }
  },

  // Get specific group details
  getGroupDetails: async (groupId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}`);
      set({ currentGroup: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load group");
      set({ isLoading: false });
      return null;
    }
  },

  // Get group messages
  getGroupMessages: async (groupId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data, isLoading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
      set({ isLoading: false });
    }
  },

  // Send message in group
  sendGroupMessage: async (groupId, messageData) => {
    const { authUser } = useAuthStore.getState();
    set({ isSendingMessage: true });
    
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/messages`, messageData);
      
      // Only add to state if the message isn't already there (prevent duplicates)
      set((state) => {
        const messageExists = state.groupMessages.some(msg => msg._id === res.data._id);
        if (!messageExists) {
          return {
            groupMessages: [...state.groupMessages, res.data],
            isSendingMessage: false,
          };
        }
        return { isSendingMessage: false };
      });
      
      // Update last message in groups list
      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === groupId
            ? { ...group, lastMessage: res.data }
            : group
        ),
      }));
      
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      set({ isSendingMessage: false });
      return null;
    }
  },

  // Add member to group
  addMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, { userId });
      set((state) => ({
        currentGroup: state.currentGroup?._id === groupId ? res.data : state.currentGroup,
        groups: state.groups.map((group) =>
          group._id === groupId ? res.data : group
        ),
      }));
      toast.success("Member added successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
      return false;
    }
  },

  // Remove member from group
  removeMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
      set((state) => ({
        currentGroup: state.currentGroup?._id === groupId ? res.data : state.currentGroup,
        groups: state.groups.map((group) =>
          group._id === groupId ? res.data : group
        ),
      }));
      toast.success("Member removed successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
      return false;
    }
  },

  // Update group info (name, avatar, etc.)
  updateGroup: async (groupId, updateData) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, updateData);
      set((state) => ({
        currentGroup: state.currentGroup?._id === groupId ? res.data : state.currentGroup,
        groups: state.groups.map((group) =>
          group._id === groupId ? res.data : group
        ),
      }));
      toast.success("Group updated successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
      return false;
    }
  },
  
  // Delete message
  deleteGroupMessage: async (groupId, messageId, deleteForEveryone = false) => {
    // Snapshot previous state for rollback
    const previousMessages = get().groupMessages;

    // Optimistically update UI
    set((state) => {
      const updatedMessages = state.groupMessages.map((msg) => {
        if (msg._id === messageId) {
          if (deleteForEveryone) {
            return {
              ...msg,
              isDeleted: true,
              text: "This message was deleted",
              image: null,
              document: null,
              video: null,
              voice: null
            };
          } else {
            return null; // For local delete, filter it out
          }
        }
        return msg;
      }).filter(Boolean);

      return { groupMessages: updatedMessages };
    });

    try {
      await axiosInstance.delete(`/messages/${messageId}`, {
        data: { deleteForEveryone }
      });
      
      toast.success("Message deleted");
      return true;
    } catch (error) {
      // Revert state on error
      set({ groupMessages: previousMessages });
      toast.error(error.response?.data?.message || "Failed to delete message");
      return false;
    }
  },

  // Leave group
  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);
      set((state) => ({
        groups: state.groups.filter((group) => group._id !== groupId),
        currentGroup: state.currentGroup?._id === groupId ? null : state.currentGroup,
      }));
      toast.success("You left the group");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
      return false;
    }
  },

  // Delete group (admin only)
  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      set((state) => ({
        groups: state.groups.filter((group) => group._id !== groupId),
        currentGroup: state.currentGroup?._id === groupId ? null : state.currentGroup,
      }));
      toast.success("Group deleted successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete group");
      return false;
    }
  },

  // Set current group
  setCurrentGroup: (group) => set({ currentGroup: group }),

  // Clear current group
  clearCurrentGroup: () => set({ currentGroup: null, groupMessages: [] }),

  // Add message to current group (for real-time updates)
  addMessageToGroup: (message) => {
    set((state) => ({
      groupMessages: [...state.groupMessages, message],
    }));
  },

  // Subscribe to group updates via Socket.IO
  subscribeToGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { authUser } = useAuthStore.getState();
    if (!socket) return;

    // Remove any existing listeners first to prevent duplicates
    socket.off("newGroupMessage");
    socket.off("groupUpdated");
    socket.off("groupDeleted");
    socket.off("messageDeleted");

    socket.on("newGroupMessage", (message) => {
      const currentGroup = get().currentGroup;
      
      // Only add message if it's not from the current user (to prevent duplicates)
      // The sender already added their message via sendGroupMessage
      const isOwnMessage = message.sender?._id === authUser?._id || message.sender === authUser?._id;
      
      if (currentGroup && message.groupId === currentGroup._id && !isOwnMessage) {
        // Check if message already exists before adding
        const messageExists = get().groupMessages.some(msg => msg._id === message._id);
        if (!messageExists) {
          get().addMessageToGroup(message);
        }
      }
      
      // Update last message in groups list
      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === message.groupId
            ? { ...group, lastMessage: message }
            : group
        ),
      }));
    });

    socket.on("groupUpdated", (updatedGroup) => {
      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === updatedGroup._id ? updatedGroup : group
        ),
        currentGroup:
          state.currentGroup?._id === updatedGroup._id
            ? updatedGroup
            : state.currentGroup,
      }));
    });

    socket.on("groupDeleted", (groupId) => {
      set((state) => ({
        groups: state.groups.filter((group) => group._id !== groupId),
        currentGroup: state.currentGroup?._id === groupId ? null : state.currentGroup,
      }));
      toast.info("A group was deleted");
    });

    socket.on("messageDeleted", ({ messageId, isDeleted }) => {
      const currentGroup = get().currentGroup;
      if (currentGroup) {
        set((state) => ({
          groupMessages: state.groupMessages.map(msg => 
            msg._id === messageId 
              ? { ...msg, isDeleted: true, text: "This message was deleted", image: null, document: null, video: null, voice: null }
              : msg
          )
        }));
      }
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newGroupMessage");
    socket.off("groupUpdated");
    socket.off("groupDeleted");
    socket.off("messageDeleted");
  },
}));
