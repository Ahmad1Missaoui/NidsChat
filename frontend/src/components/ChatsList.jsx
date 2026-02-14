import React, { useMemo, useEffect } from 'react'
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { UsersIcon } from "lucide-react";

function ChatsList({ searchQuery = "", filter = "All" }) {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, setSelectedGroup, selectedUser, selectedGroup, getUnreadCounts, unreadCounts } = useChatStore();
  const { groups, getGroups } = useGroupStore();
  const { onlineUsers } = useAuthStore();

  React.useEffect(() => {
    getMyChatPartners();
    getGroups();
    getUnreadCounts(); // Fetch unread counts
  }, [getMyChatPartners, getGroups, getUnreadCounts]);

  const filteredItems = useMemo(() => {
    let items = [];
    
    // Normalize data structures
    const chatItems = chats.map(c => ({ 
        ...c, 
        type: 'chat', 
        displayName: c.fullName, 
        displaySubtitle: c.username ? `@${c.username}` : '',
        image: c.profilePic,
        id: c._id
    }));
    
    const groupItems = groups.map(g => ({ 
        ...g, 
        type: 'group', 
        displayName: g.name, 
        displaySubtitle: `${g.members?.length || 0} members`,
        image: g.groupPic,
        id: g._id
    }));
    
    if (filter === "Groups") {
        items = groupItems;
    } else if (filter === "Unread") {
        // Filter chats with actual unread messages
        items = chatItems.filter(c => unreadCounts[c.id] > 0); 
    } else if (filter === "Favorites") {
        items = chatItems.filter(c => false); // Mock empty
    } else {
        items = [...chatItems, ...groupItems];
    }
    
    if (searchQuery.trim()) {
       items = items.filter(item => 
          item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.displaySubtitle.toLowerCase().includes(searchQuery.toLowerCase())
       );
    }
    
    return items;
  }, [chats, groups, searchQuery, filter]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (filteredItems.length === 0) return <NoChatsFound />;

  return (
    <div className="flex flex-col gap-1 px-2 pb-2">
      {filteredItems.map((item) => {
          const isSelected = (item.type === 'chat' && selectedUser?._id === item.id) || 
                             (item.type === 'group' && selectedGroup?._id === item.id);
                             
          return (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => item.type === 'chat' ? setSelectedUser(item) : setSelectedGroup(item)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group relative
                ${isSelected 
                    ? "bg-amber-100 dark:bg-[rgba(212,175,55,0.15)]" 
                    : "hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.03)]"
                }`}
            >
               {/* Avatar */}
               <div className="relative flex-shrink-0">
                  <div className="size-12 rounded-full overflow-hidden border border-gray-100 dark:border-[rgba(255,255,255,0.05)]">
                    <img 
                        src={item.image || "/avatar.png"} 
                        alt={item.displayName} 
                        className="w-full h-full object-cover"
                    />
                  </div>
                  {item.type === 'chat' && onlineUsers.includes(item.id) && (
                      <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-[#0b0b0f]"></div>
                  )}
                  {item.type === 'group' && (
                      <div className="absolute -bottom-1 -right-1 bg-gray-200 dark:bg-[#1a1a2e] rounded-full p-1 ring-1 ring-white dark:ring-black">
                         <UsersIcon className="w-2.5 h-2.5 text-gray-600 dark:text-gray-300" />
                      </div>
                  )}
               </div>
               
               {/* Content */}
               <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline">
                      <h4 className={`text-[15px] font-semibold truncate leading-tight ${isSelected ? "text-amber-900 dark:text-[#facc15]" : "text-gray-900 dark:text-gray-100"}`}>
                          {item.displayName}
                      </h4>
                      {/* Mock date/time */}
                      <span className={`text-[11px] ml-2 flex-shrink-0 ${isSelected ? "text-amber-700/80 dark:text-[#facc15]/70" : "text-gray-400 dark:text-gray-500"}`}>
                        {Math.random() > 0.5 ? 'Tuesday' : '10:45 AM'}
                      </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-0.5">
                     <p className={`text-[13px] truncate max-w-[85%] ${isSelected ? "text-amber-700/80 dark:text-[#facc15]/60" : "text-gray-500 dark:text-gray-400"}`}>
                        {item.displaySubtitle}
                     </p>
                     
                     {/* Real Unread Badge */}
                     {item.type === 'chat' && unreadCounts[item.id] > 0 && (
                        <span className="min-w-[18px] h-[18px] bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold px-1">
                            {unreadCounts[item.id] > 99 ? '99+' : unreadCounts[item.id]}
                        </span>
                     )}
                  </div>
               </div>
            </div>
          )
      })}
    </div>
  );
}
export default ChatsList;
