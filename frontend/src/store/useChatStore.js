import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  typingUsers: [],
  unreadCounts: {}, // { userId: count }
  totalUnreadCount: 0,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser, selectedGroup: null }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup, selectedUser: null }),

  subscribeToTyping: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("typing", ({ from }) => {
        set((state) => ({
            typingUsers: [...state.typingUsers, from]
        }));
    });

    socket.on("stopTyping", ({ from }) => {
        set((state) => ({
            typingUsers: state.typingUsers.filter((id) => id !== from)
        }));
    });
  },

  unsubscribeFromTyping: () => {
      const socket = useAuthStore.getState().socket;
      if (!socket) return;
      socket.off("typing");
      socket.off("stopTyping");
  },

  subscribeToReactions: () => {
      const socket = useAuthStore.getState().socket;
      if (!socket) return;
      socket.on("messageReaction", ({ messageId, reaction }) => {
          const { messages } = get();
          set({
              messages: messages.map(msg => {
                  if (msg._id === messageId) {
                       // update local reaction state
                       const existingIdx = msg.reactions?.findIndex(r => r.userId === reaction.userId);
                       let newReactions = msg.reactions ? [...msg.reactions] : [];
                       if (existingIdx > -1) {
                           if (newReactions[existingIdx].emoji === reaction.emoji) {
                               newReactions.splice(existingIdx, 1); // remove
                           } else {
                               newReactions[existingIdx].emoji = reaction.emoji; // update
                           }
                       } else {
                           newReactions.push(reaction);
                       }
                       return { ...msg, reactions: newReactions };
                  }
                  return msg;
              })
          });
      });
  },

  unsubscribeFromReactions: () => {
      const socket = useAuthStore.getState().socket;
      if (!socket) return;
      socket.off("messageReaction");
  },
  
  subscribeToReadReceipts: () => {
      const socket = useAuthStore.getState().socket;
      if (!socket) return;
      socket.on("messagesRead", ({ by }) => {
          const { messages, selectedUser } = get();
          if (selectedUser && selectedUser._id === by) {
               set({
                   messages: messages.map(msg => ({
                       ...msg,
                       readBy: msg.readBy ? [...new Set([...msg.readBy, by])] : [by]
                   }))
               });
          }
      });
  },

  unsubscribeFromReadReceipts: () => {
      const socket = useAuthStore.getState().socket;
      if (!socket) return;
      socket.off("messagesRead");
  },

  reactToMessage: async (messageId, emoji) => {
      try {
          await axiosInstance.post(`/messages/${messageId}/react`, { emoji });
          // Optimistic update
           const { messages, authUser } = get();
             // (Wait, I need authUser from get() but authStore is separate. Using getState)
           const myId = useAuthStore.getState().authUser._id;

           set({
              messages: messages.map(msg => {
                  if (msg._id === messageId) {
                       const existingIdx = msg.reactions?.findIndex(r => {
                           const rId = typeof r.userId === 'object' ? r.userId._id : r.userId;
                           return rId === myId;
                       });
                       let newReactions = msg.reactions ? [...msg.reactions] : [];
                       if (existingIdx > -1 && existingIdx !== undefined) {
                           if (newReactions[existingIdx].emoji === emoji) {
                               newReactions.splice(existingIdx, 1);
                           } else {
                               newReactions[existingIdx].emoji = emoji;
                           }
                       } else {
                           // Use full user object if available for immediate UI consistency if UI expects it
                           const user = useAuthStore.getState().authUser;
                           newReactions.push({ userId: user, emoji });
                       }
                       return { ...msg, reactions: newReactions };
                  }
                  return msg;
              })
          });

      } catch (error) {
          toast.error("Failed to react");
      }
  },

  markMessagesAsRead: async (senderId) => {
       try {
           await axiosInstance.put(`/messages/read/${senderId}`);
           const socket = useAuthStore.getState().socket;
           socket.emit("markMessagesAsRead", { senderId });
       } catch (error) {
           console.error("Failed to mark as read");
       }
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  deleteMessage: async (messageId, deleteForEveryone = false) => {
    const { messages } = get();
    const previousMessages = [...messages]; // Snapshot state

    // Optimistic Update
    if (deleteForEveryone) {
      set({
        messages: messages.map(msg => 
          msg._id === messageId 
            ? { ...msg, isDeleted: true, text: "This message was deleted", image: null, document: null, video: null, voice: null }
            : msg
        )
      });
    } else {
      set({ messages: messages.filter(msg => msg._id !== messageId) });
    }
    
    try {
      await axiosInstance.delete(`/messages/${messageId}`, {
        data: { deleteForEveryone }
      });
      
      toast.success(deleteForEveryone ? "Message deleted for everyone" : "Message deleted for you");
    } catch (error) {
      // Revert on error
      set({ messages: previousMessages });
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  clearConversationForUser: (userId) => {
    const { chats, selectedUser } = get();
    const nextChats = chats.filter((chat) => chat._id !== userId);
    const shouldClearMessages = selectedUser && selectedUser._id === userId;

    set({
      chats: nextChats,
      messages: shouldClearMessages ? [] : get().messages,
      selectedUser: shouldClearMessages ? null : selectedUser,
    });
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0; // reset to start
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    socket.on("messageDeleted", ({ messageId, isDeleted }) => {
      const currentMessages = get().messages;
      set({
        messages: currentMessages.map(msg =>
          msg._id === messageId
            ? { ...msg, isDeleted: true, text: "This message was deleted", image: null, document: null, video: null, voice: null }
            : msg
        )
      });
    });

    socket.on("messageReaction", ({ messageId, reactions }) => {
      const currentMessages = get().messages;
      set({
        messages: currentMessages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        ),
      });
    });

    socket.on("messagesRead", ({ conversationId }) => {
      const { selectedUser, messages } = get();
      if (selectedUser && selectedUser._id === conversationId) {
        set({
          messages: messages.map((msg) => ({
            ...msg,
            readBy: (msg.readBy || []).includes(conversationId) 
              ? msg.readBy 
              : [...(msg.readBy || []), conversationId]
          })),
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("messageReaction");
    socket.off("messagesRead");
  },
  
  // Unread message functions
  getUnreadCounts: async () => {
    try {
      const { data } = await axiosInstance.get("/messages/unread/by-conversation");
      set({ unreadCounts: data });
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  },

  getTotalUnreadCount: async () => {
    try {
      const { data } = await axiosInstance.get("/messages/unread/total");
      set({ totalUnreadCount: data.count });
      return data.count;
    } catch (error) {
      console.error("Error fetching total unread count:", error);
      return 0;
    }
  },

  markAsRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/read/${userId}`);
      // Update unread counts locally
      const newCounts = { ...get().unreadCounts };
      delete newCounts[userId];
      set({ unreadCounts: newCounts });
      get().getTotalUnreadCount();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },
}));