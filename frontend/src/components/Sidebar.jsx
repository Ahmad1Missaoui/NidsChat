import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useFriendStore } from "../store/useFriendStore";
import { MessageSquare, Phone, Users, Settings, Plus, Bot, Menu, X, UserPlus } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const Sidebar = ({ onOpenNewChat }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { authUser, logout } = useAuthStore();
    const { totalUnreadCount, getTotalUnreadCount } = useChatStore();
    const { getMissedCallsCount } = useCallStore();
    const { unreadRequestsCount, getFriendRequests } = useFriendStore();
    const [missedCallsCount, setMissedCallsCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    useEffect(() => {
        if (authUser) {
            getTotalUnreadCount();
            fetchMissedCalls();
            getFriendRequests();
            const interval = setInterval(() => {
                getTotalUnreadCount();
                fetchMissedCalls();
                getFriendRequests();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [authUser, getFriendRequests]);
    
    const fetchMissedCalls = async () => {
        const count = await getMissedCallsCount();
        setMissedCallsCount(count);
    };
    
    const handleLogout = () => {
        if (window.confirm(t('sidebar.logout_confirm'))) {
            logout();
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;
    
    return (
        <>
        {/* Mobile Hamburger Button - Fixed at top */}
        <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="fixed top-4 left-4 z-50 md:hidden p-3 bg-[#121212] text-white rounded-xl shadow-lg"
        >
            {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}

        {/* Sidebar */}
        <aside className={`
            h-full w-[80px] flex flex-col items-center py-6 gap-6 bg-[#121212] flex-shrink-0 z-50
            fixed md:relative
            transition-transform duration-300
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
             {/* Logo */}
             <div className="mb-2">
                <img src="/logonids.avif" alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
             </div>

             {/* Navigation Icons */}
             <div className="flex flex-col gap-4 w-full items-center">
                  {/* All Chats */}
                  <div className="tooltip tooltip-right z-50" data-tip={t('sidebar.all_chats')}>
                      <button 
                        onClick={() => handleNavigate('/chats')}
                        className={`relative p-3.5 rounded-2xl transition-all duration-300 ${
                            isActive('/chats')
                                ? 'bg-[#2a2a2a] text-white shadow-lg shadow-black/20'
                                : 'text-gray-500 hover:bg-[#2a2a2a] hover:text-gray-300'
                         }`}
                      >
                           <MessageSquare className="size-6" />
                           {totalUnreadCount > 0 && (
                               <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#ff4b4b] rounded-full text-[10px] text-white flex items-center justify-center font-bold px-1 border-2 border-[#121212]">
                                   {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                               </span>
                           )}
                      </button>
                  </div>
                   
                   {/* Friend Requests */}
                   <div className="tooltip tooltip-right z-50" data-tip={t('sidebar.friend_requests') || 'Friend Requests'}>
                     <button 
                        onClick={() => handleNavigate('/friend-requests')}
                        className={`relative p-3.5 rounded-2xl transition-all duration-300 ${
                            isActive('/friend-requests')
                                ? 'bg-[#2a2a2a] text-white shadow-lg shadow-black/20'
                                : 'text-gray-500 hover:bg-[#2a2a2a] hover:text-gray-300'
                         }`}
                     >
                         <UserPlus className="size-6" />
                          {unreadRequestsCount > 0 && (
                              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-[#facc15] to-[#d4af37] rounded-full text-[10px] text-black flex items-center justify-center font-bold px-1 border-2 border-[#121212] animate-pulse shadow-lg shadow-[#facc15]/50">
                                  {unreadRequestsCount > 99 ? '99+' : unreadRequestsCount}
                              </span>
                          )}
                     </button>
                   </div>

                   {/* Calls (was Work) */}
                   <div className="tooltip tooltip-right z-50" data-tip={t('sidebar.calls')}>
                     <button 
                        onClick={() => handleNavigate('/calls')}
                        className={`relative p-3.5 rounded-2xl transition-all duration-300 ${
                            isActive('/calls')
                                ? 'bg-[#2a2a2a] text-white shadow-lg shadow-black/20'
                                : 'text-gray-500 hover:bg-[#2a2a2a] hover:text-gray-300'
                         }`}
                     >
                         <Phone className="size-6" />
                          {missedCallsCount > 0 && (
                              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#ff4b4b] rounded-full text-[10px] text-white flex items-center justify-center font-bold px-1 border-2 border-[#121212]">
                                  {missedCallsCount > 99 ? '99+' : missedCallsCount}
                              </span>
                          )}
                     </button>
                   </div>

                   {/* Groups (was News) */}
                   <div className="tooltip tooltip-right z-50" data-tip={t('sidebar.groups')}>
                     <button 
                        onClick={() => handleNavigate('/groups')}
                        className={`p-3.5 rounded-2xl transition-all duration-300 ${
                            isActive('/groups')
                                ? 'bg-[#2a2a2a] text-white shadow-lg shadow-black/20'
                                : 'text-gray-500 hover:bg-[#2a2a2a] hover:text-gray-300'
                         }`}
                     >
                          <Users className="size-6" />
                     </button>
                   </div>

                   {/* Nids AI */}
                   <div className="tooltip tooltip-right z-50" data-tip={t('sidebar.ai_chat')}>
                     <button 
                        onClick={() => handleNavigate('/ai-chat')}
                        className={`p-3.5 rounded-2xl transition-all duration-300 ${
                            isActive('/ai-chat')
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-gray-500 hover:bg-[#2a2a2a] hover:text-gray-300'
                         }`}
                     >
                          <Bot className="size-6" />
                     </button>
                   </div>

                   {/* Add / New (was Profile position in text description, 4th item) */}
                   <div className="tooltip tooltip-right z-50" data-tip="New Chat">
                     <button 
                        onClick={() => {
                            if (onOpenNewChat) {
                                onOpenNewChat();
                            } else {
                                handleNavigate('/search');
                            }
                            setIsMobileMenuOpen(false);
                        }}
                        className={`p-3.5 rounded-2xl transition-all duration-300 bg-[#2a2a2a] text-amber-500 hover:bg-[#333333] hover:text-amber-400 shadow-lg shadow-black/20`}
                     >
                          <Plus className="size-6" />
                     </button>
                   </div>
             </div>
             
             <div className="flex-1" /> {/* Spacer */}
             
             {/* Bottom Section */}
             <div className="flex flex-col gap-6 w-full items-center mb-2">
                 {/* Settings (was Edit) */}
                 <div className="tooltip tooltip-right z-50" data-tip={t('sidebar.settings')}>
                     <button 
                        onClick={() => handleNavigate('/settings')}
                        className={`p-3.5 rounded-2xl transition-all duration-300 ${
                            isActive('/settings')
                                ? 'bg-[#2a2a2a] text-white shadow-lg shadow-black/20'
                                : 'text-gray-500 hover:bg-[#2a2a2a] hover:text-gray-300'
                         }`}
                     >
                         <Settings className="size-6" />
                     </button>
                 </div>
                  
                 {/* User Profile */}
                <div className="tooltip tooltip-right z-50" data-tip="Profile">
                    <div className="relative group cursor-pointer" onClick={() => handleNavigate('/profile')}>
                       <div className={`size-10 rounded-full overflow-hidden border-2 transition-all 
                            ${isActive('/profile') ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-transparent hover:border-amber-400'}`}>
                            <img 
                                src={authUser?.profilePic || "/avatar.png"} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                       </div>
                       <div className="absolute -bottom-1 -right-1 bg-green-500 size-3 rounded-full border-2 border-[#121212]"></div>
                    </div>
                </div>
             </div>
        </aside>
        </>
    )
}
export default Sidebar;
