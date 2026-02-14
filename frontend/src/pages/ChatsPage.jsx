import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from "react-i18next";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import Sidebar from "../components/Sidebar";
import ChatsList from "../components/ChatsList";
import ChatContainer from "../components/ChatContainer";
import ContactList from "../components/ContactList";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import { SearchIcon, Plus, MoreVertical, Archive, X, UserPlus, Bell } from "lucide-react";

function ChatPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedUser, selectedGroup } = useChatStore();
  const { theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showContactList, setShowContactList] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  // Resizing State
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        // Adjust for fixed sidebar width (64px)
        const newWidth = mouseMoveEvent.clientX - 64; 
        if (newWidth >= 280 && newWidth <= 600) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // Handle cursor style
  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
  }, [isResizing]);
// Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Close contact list modal when a user is selected
  useEffect(() => {
    if (selectedUser) {
      setShowContactList(false);
    }
  }, [selectedUser]);

  return (
    <div className="h-screen w-screen flex bg-[#121212] overflow-hidden transition-colors duration-300">
        
        {/* SIDEBAR NAVIGATION */}
        <Sidebar onOpenNewChat={() => setShowContactList(true)} />

        {/* MAIN CONTENT AREA (Rounded Card Style) */}
        <div className="flex-1 flex bg-transparent overflow-hidden relative z-10 h-full p-0 md:p-2 md:py-3 pt-16 md:pt-2">
        
          {/* CHAT LIST PANEL (Resizable) */}
          <div 
            style={{ width: window.innerWidth >= 768 ? sidebarWidth : '100%' }}
            className={`
              flex flex-col flex-shrink-0 z-10
              bg-white dark:bg-[#0b0b0f]
              rounded-none md:rounded-[42px] overflow-hidden shadow-lg border-0 md:border md:border-gray-100 md:dark:border-[rgba(255,255,255,0.05)]
              transition-all duration-300
              ${selectedUser || selectedGroup ? 'hidden md:flex' : 'flex'}
            `}
          >
          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex justify-between items-center">
             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('chats.title')}</h1>
             <div className="flex gap-2 text-gray-500 dark:text-gray-400 relative">
                <div className="relative" ref={menuRef}>
                  <button 
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
                      title="More options"
                  >
                      <MoreVertical size={22} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-[rgba(212,175,55,0.3)] rounded-xl shadow-lg dark:shadow-[0_0_20px_rgba(212,175,55,0.2)] py-2 z-50">
                      <button
                        onClick={() => {
                          navigate('/friend-requests');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-[rgba(212,175,55,0.1)] transition-colors text-left"
                      >
                        <Bell size={18} className="text-gray-600 dark:text-gray-300" />
                        <span className="text-gray-800 dark:text-white font-medium">{t('friend_requests.title')}</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/search');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-[rgba(212,175,55,0.1)] transition-colors text-left"
                      >
                        <UserPlus size={18} className="text-gray-600 dark:text-gray-300" />
                        <span className="text-gray-800 dark:text-white font-medium">{t('user_search.title')}</span>
                      </button>
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="text"
                placeholder={t('chats.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#18181b] border-none rounded-2xl py-2.5 pl-10 pr-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-[15px] focus:ring-1 focus:ring-amber-400/50 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
             {/* Archive bar (Optional, inspired by Whatsapp) 
             <div className="px-5 py-3 flex items-center gap-4 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer mx-2 rounded-xl">
                 <Archive className="size-5" />
                 <span className="font-medium">Archived</span>
             </div>
             */}
            <ChatsList searchQuery={searchQuery} filter={filter} />
          </div>

        </div>

        {/* RESIZE HANDLE */}
        <div
            className="w-1 mx-1 hover:w-1.5 cursor-col-resize hover:bg-amber-400/50 transition-all hidden md:block z-20 rounded-full"
            onMouseDown={startResizing}
        />

        {/* RIGHT SIDE */}
        <div className={`flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-[#121212] rounded-none md:rounded-[42px] overflow-hidden shadow-lg border-0 md:border md:border-gray-100 md:dark:border-[rgba(255,255,255,0.05)] w-full min-h-0 ${!selectedUser && !selectedGroup ? "hidden md:flex" : "flex"}`}>
            {!selectedUser && !selectedGroup ? <NoConversationPlaceholder /> : <ChatContainer />}
        </div>
        
        </div> {/* End of Rounded Content Area */}

        {/* Contact List Modal */}
        {showContactList && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowContactList(false)}
          >
            <div 
              className="bg-white dark:bg-[#0b0b0f] rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-gray-200 dark:border-[rgba(212,175,55,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[rgba(212,175,55,0.2)] flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('chats.new_chat')}</h2>
                <button
                  onClick={() => setShowContactList(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-hidden">
                <ContactList searchQuery="" />
              </div>
            </div>
          </div>
        )}

    </div>
  );
}

export default ChatPage;
