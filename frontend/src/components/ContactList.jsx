import React from 'react'

import { useEffect, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router";
import { UserPlusIcon, BellIcon, UsersIcon } from "lucide-react";

function ContactList({ searchQuery = "" }) {
  const navigate = useNavigate();
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { unreadRequestsCount, getFriendRequests } = useFriendStore();

  useEffect(() => {
    getAllContacts();
    getFriendRequests();
  }, [getAllContacts, getFriendRequests]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return allContacts;
    return allContacts.filter(contact => 
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allContacts, searchQuery]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <div className="flex flex-col h-full">
      {/* Action Buttons */}
      <div className="p-4 space-y-3 border-b border-gray-200 dark:border-[rgba(212,175,55,0.2)]">
        <button
          onClick={() => navigate("/search")}
          className="w-full bg-amber-700 hover:bg-amber-800 dark:bg-gradient-to-r dark:from-[#facc15] dark:via-[#ffd700] dark:to-[#d4af37] dark:hover:from-[#d4af37] dark:hover:via-[#facc15] dark:hover:to-[#b8860b] text-white dark:text-black rounded-xl py-3.5 px-4 flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md dark:shadow-xl dark:shadow-[rgba(212,175,55,0.5)] dark:hover:shadow-2xl dark:hover:shadow-[rgba(212,175,55,0.7)] font-black uppercase text-sm tracking-wider transform hover:scale-105 active:scale-95 border-2 border-transparent dark:border-[#ffd700]/30"
        >
          <UserPlusIcon className="w-5 h-5" />
          Find Friends
        </button>
        
        <button
          onClick={() => navigate("/friend-requests")}
          className="w-full bg-white dark:bg-[rgba(12,12,18,0.8)] dark:backdrop-blur-md border border-gray-200 dark:border-2 dark:border-[rgba(212,175,55,0.4)] dark:hover:border-[rgba(212,175,55,0.7)] text-gray-800 dark:text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2.5 transition-all duration-300 font-black uppercase text-sm tracking-wide relative overflow-hidden group shadow-sm hover:bg-gray-50 dark:hover:bg-transparent dark:shadow-lg dark:hover:shadow-[rgba(212,175,55,0.3)] transform hover:scale-105 active:scale-95"
        >
          <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-[#facc15]/0 via-[#facc15]/20 to-[#facc15]/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <BellIcon className="w-5 h-5 relative z-10 text-gray-600 dark:text-white" />
          <span className="relative z-10">Friend Requests</span>
          {unreadRequestsCount > 0 && (
            <span className="relative z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-full w-7 h-7 flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
              {unreadRequestsCount > 9 ? '9+' : unreadRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate("/groups")}
          className="w-full bg-white dark:bg-[rgba(12,12,18,0.8)] dark:backdrop-blur-md border border-gray-200 dark:border-2 dark:border-[rgba(212,175,55,0.4)] dark:hover:border-[rgba(212,175,55,0.7)] text-gray-800 dark:text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2.5 transition-all duration-300 font-black uppercase text-sm tracking-wide relative overflow-hidden group shadow-sm hover:bg-gray-50 dark:hover:bg-transparent dark:shadow-lg dark:hover:shadow-[rgba(212,175,55,0.3)] transform hover:scale-105 active:scale-95"
        >
          <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-[#facc15]/0 via-[#facc15]/20 to-[#facc15]/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <UsersIcon className="w-5 h-5 relative z-10 text-gray-600 dark:text-white" />
          <span className="relative z-10">My Groups</span>
        </button>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <UserPlusIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchQuery ? "No friends found" : "No friends yet. Start by finding some!"}
            </p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact._id}
              className="p-4 rounded-xl cursor-pointer bg-white dark:bg-[rgba(12,12,18,0.7)] border border-gray-200 dark:border-[rgba(212,175,55,0.18)] hover:bg-gray-50 dark:hover:bg-transparent hover:border-gray-300 dark:hover:border-[rgba(212,175,55,0.35)] dark:hover:shadow-[0_0_18px_rgba(212,175,55,0.25)] transition-all duration-200"
              onClick={() => setSelectedUser(contact)}
            >
              <div className="flex items-center gap-3">
                <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
                  <div className="size-12 rounded-full ring-2 ring-gray-200 dark:ring-[rgba(212,175,55,0.35)] ring-offset-2 ring-offset-white dark:ring-offset-[#0b0b0f]">
                    <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-900 dark:text-white font-semibold truncate">{contact.fullName}</h4>
                  <p className="text-xs text-gray-500 dark:text-[#facc15] truncate">@{contact.username}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default ContactList;