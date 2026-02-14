import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useFriendStore } from "./useFriendStore";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],

  
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

    signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      // Don't set authUser - user needs to verify email first
      toast.success(res.data.message || "Account created! Please check your email to verify your account.", {
        duration: 6000,
      });
      return { success: true, email: res.data.email };
    } catch (error) {
      toast.error(error.response.data.message);
      return { success: false };
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      toast.success("Logged in successfully");

      get().connectSocket();
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data;
      toast.error(errorData?.message || "Login failed");
      // Return email verification info if needed
      if (errorData?.emailNotVerified) {
        return { success: false, emailNotVerified: true, email: errorData.email };
      }
      return { success: false };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Logout failed. Please try again.",
      );
    }
  },
  updateProfile: async (data) => {
    try {
      console.log("Sending update profile request...");
      const res = await axiosInstance.put("/auth/update-profile", data);
      console.log("Updated user data:", res.data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in update profile:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";
      toast.error(errorMessage);
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      await axiosInstance.put("/auth/change-password", { 
        currentPassword, 
        newPassword 
      });
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Error in change password:", error);
      const errorMessage = error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
      throw error;
    }
  },

  verifyEmail: async (token) => {
    try {
      const res = await axiosInstance.get(`/auth/verify-email?token=${token}`);
      set({ authUser: res.data.user });
      toast.success(res.data.message || "Email verified successfully!");
      get().connectSocket();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Verification failed";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  resendVerification: async (email) => {
    try {
      const res = await axiosInstance.post("/auth/resend-verification", { email });
      toast.success(res.data.message || "Verification email sent!");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to resend verification email";
      toast.error(errorMessage);
      return { success: false };
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true, 
    });

    socket.connect();

    set({ socket });

    // listen for online users event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Listen for friend request events
    socket.on("newFriendRequest", (data) => {
      useFriendStore.getState().addFriendRequest(data);
      toast.success(`${data.fullName} sent you a friend request!`, {
        icon: "👋",
        duration: 4000,
      });
    });

    socket.on("friendRequestAccepted", (data) => {
      useFriendStore.getState().getFriends();
      toast.success(`${data.fullName} accepted your friend request!`, {
        icon: "🎉",
        duration: 4000,
      });
    });

    socket.on("addedToGroup", (data) => {
      toast.success(`${data.addedBy.fullName} added you to ${data.group.name}`, {
        icon: "👥",
        duration: 4000,
      });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
