import React from 'react'
import { XIcon, PhoneIcon, VideoIcon, SettingsIcon, BanIcon, ShieldOffIcon, UserMinusIcon, Trash2Icon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import { useFriendStore } from "../store/useFriendStore";

function ChatHeader({ group = null, onBack = null, onSettingsClick = null, isAdmin = false }) {
  const { selectedUser, setSelectedUser, getMyChatPartners, clearConversationForUser } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { startCall } = useCallStore();
  const { blockUser, unblockUser, removeFriend, blockedUsers, getBlockedUsers, checkFriendship, friendshipStatusByUser } = useFriendStore();
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  
  // Determine if this is a group or user chat
  const isGroupChat = !!group;
  const chatUser = isGroupChat ? null : selectedUser;
  const isOnline = !isGroupChat && chatUser && onlineUsers.includes(chatUser._id);

  useEffect(() => {
    if (!isGroupChat && selectedUser) {
      getBlockedUsers();
      checkFriendship(selectedUser._id);
    }
  }, [selectedUser, isGroupChat, getBlockedUsers, checkFriendship]);

  useEffect(() => {
    if (!isGroupChat && selectedUser) {
      const blocked = blockedUsers.some(u => u._id === selectedUser._id);
      setIsBlocked(blocked);
    }
  }, [blockedUsers, selectedUser, isGroupChat]);

  useEffect(() => {
    if (!isGroupChat && selectedUser) {
      const status = friendshipStatusByUser[selectedUser._id];
      setIsBlockedByOther(!!status?.isBlockedByOther);
    }
  }, [friendshipStatusByUser, selectedUser, isGroupChat]);

  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        if (isGroupChat && onBack) {
          onBack();
        } else {
          setSelectedUser(null);
        }
      }
    };
    window.addEventListener("keydown", handleEscKey);

    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser, isGroupChat, onBack]);

  const handleClose = () => {
    if (isGroupChat && onBack) {
      onBack();
    } else {
      setSelectedUser(null);
    }
  };

  const handleCallClick = (type) => {
    if (isGroupChat) {
      startCall(group, type);
    } else {
      startCall(chatUser, type);
    }
  };

  const handleBlockToggle = async () => {
    if (!chatUser) return;
    
    if (isBlocked) {
      const success = await unblockUser(chatUser._id);
      if (success) {
        setIsBlocked(false);
        // Re-check friendship status after unblocking
        await checkFriendship(chatUser._id);
      }
    } else {
      if (confirm(`Block ${chatUser.fullName}? You will still be friends, but cannot send or receive messages or calls.`)) {
        const success = await blockUser(chatUser._id);
        if (success) {
          setIsBlocked(true);
          // Don't close chat - user remains in friends list
        }
      }
    }
  };

  const handleUnfriend = async () => {
    if (!chatUser) return;
    if (confirm(`Are you sure you want to remove ${chatUser.fullName} from your friends?`)) {
      const success = await removeFriend(chatUser._id);
      if (success) {
        await getMyChatPartners();
        setSelectedUser(null);
      }
    }
  };

  const handleDeleteChat = () => {
    if (!chatUser) return;
    if (confirm(`Delete your conversation with ${chatUser.fullName}? This only removes it for you.`)) {
      clearConversationForUser(chatUser._id);
    }
  };

  return (
    <div
      className="flex justify-between items-center bg-white/80 dark:bg-[rgba(12,12,18,0.7)] backdrop-blur-md m-1 md:m-2 rounded-[16px] md:rounded-[24px] shadow-sm border border-gray-200/50 dark:border-[rgba(255,255,255,0.08)] px-3 md:px-5 py-2 md:py-3 transition-all duration-300 z-50 ml-2 mr-2 md:ml-6 md:mr-6"
    >
      <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
        <div className={`avatar ${!isGroupChat && isOnline ? "online" : "offline"}`}>
          <div className="w-10 md:w-12 rounded-full ring-2 ring-gray-200 dark:ring-[rgba(212,175,55,0.35)] ring-offset-1 md:ring-offset-2 ring-offset-white dark:ring-offset-[#0b0b0f]">
            <img 
              src={isGroupChat ? (group?.groupPic || "/avatar.png") : (chatUser?.profilePic || "/avatar.png")} 
              alt={isGroupChat ? group?.name : chatUser?.fullName} 
            />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-gray-900 dark:text-white font-semibold tracking-wide flex items-center gap-2 text-sm md:text-base truncate">
            {isGroupChat ? group?.name : chatUser?.fullName}
            {isGroupChat && isAdmin && (
              <span className="text-[10px] md:text-xs bg-gradient-to-r from-amber-600 to-amber-800 dark:from-[#facc15] dark:to-[#d4af37] text-white dark:text-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-bold whitespace-nowrap">
                ADMIN
              </span>
            )}
          </h3>
          <p className="text-gray-500 dark:text-[#facc15] text-[10px] md:text-xs uppercase tracking-[0.2em] truncate">
            {isGroupChat 
              ? `${group?.members?.length || 0} member${group?.members?.length !== 1 ? 's' : ''}` 
              : (isOnline ? "Online" : "Offline")
            }
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
        {/* Voice Call Button */}
        {!isBlocked && !isBlockedByOther && (
          <button
            onClick={() => handleCallClick('voice')}
            className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-gray-50 dark:bg-[rgba(12,12,18,0.8)] border border-gray-200 dark:border-[rgba(212,175,55,0.25)] text-gray-600 dark:text-[#facc15] hover:bg-gray-100 dark:hover:bg-[rgba(212,175,55,0.12)] shadow-sm dark:shadow-none dark:hover:shadow-[0_0_16px_rgba(212,175,55,0.3)] transition-all"
            title="Voice Call"
          >
            <PhoneIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}

        {/* Video Call Button */}
        {!isBlocked && !isBlockedByOther && (
          <button
            onClick={() => handleCallClick('video')}
            className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-gray-50 dark:bg-[rgba(12,12,18,0.8)] border border-gray-200 dark:border-[rgba(212,175,55,0.25)] text-gray-600 dark:text-[#facc15] hover:bg-gray-100 dark:hover:bg-[rgba(212,175,55,0.12)] shadow-sm dark:shadow-none dark:hover:shadow-[0_0_16px_rgba(212,175,55,0.3)] transition-all"
            title="Video Call"
          >
            <VideoIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}

        {/* User Settings Menu (for direct chats only) */}
        {!isGroupChat && chatUser && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-gray-50 dark:bg-[rgba(12,12,18,0.8)] border border-gray-200 dark:border-[rgba(212,175,55,0.25)] text-gray-600 dark:text-[#facc15] hover:bg-gray-100 dark:hover:bg-[rgba(212,175,55,0.12)] shadow-sm dark:shadow-none dark:hover:shadow-[0_0_16px_rgba(212,175,55,0.3)] transition-all"
              title="Conversation Settings"
            >
              <SettingsIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-[#14141c] border border-gray-200 dark:border-[#2a2a34] shadow-xl dark:shadow-2xl z-[100] overflow-hidden">
                {isBlockedByOther ? (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#2a2a34]">
                    You are blocked by this user
                  </div>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        await handleBlockToggle();
                        setShowUserMenu(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-sm transition-all ${
                        isBlocked
                          ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10"
                          : "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                      }`}
                    >
                      {isBlocked ? <ShieldOffIcon className="w-4 h-4" /> : <BanIcon className="w-4 h-4" />}
                      {isBlocked ? "Unblock User" : "Block User"}
                    </button>
                    <button
                      onClick={async () => {
                        await handleUnfriend();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
                    >
                      <UserMinusIcon className="w-4 h-4" />
                      Unfriend User
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    handleDeleteChat();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  <Trash2Icon className="w-4 h-4" />
                  Delete Chat
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings Button (for groups) */}
        {isGroupChat && onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-gray-50 dark:bg-[rgba(12,12,18,0.8)] border border-gray-200 dark:border-[rgba(212,175,55,0.25)] text-gray-600 dark:text-[#facc15] hover:bg-gray-100 dark:hover:bg-[rgba(212,175,55,0.12)] shadow-sm dark:shadow-none dark:hover:shadow-[0_0_16px_rgba(212,175,55,0.3)] transition-all"
            title="Group Settings"
          >
            <SettingsIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}

        {/* Close Button */}
        <button onClick={handleClose} className="md:block">
          <XIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500 dark:text-[#facc15] hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;