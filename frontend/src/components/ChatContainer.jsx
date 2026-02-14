import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useCallStore } from "../store/useCallStore";
import { useFriendStore } from "../store/useFriendStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import MessageList from "./chat/MessageList";
import GroupInfoSidebar from "./chat/GroupInfoSidebar";
import { BanIcon, UsersIcon } from "lucide-react";
import { useChatBackground } from "../hooks/useChatBackground";
import { useMessageSubscriptions } from "../hooks/useMessageSubscriptions";
import { isUserAdmin } from "../utils/chatHelpers";
import "../styles/chat.css";

/**
 * ChatContainer Component - Refactored
 * Main chat interface with optimized performance and modular architecture
 * 
 * Key Improvements:
 * - Modular component architecture
 * - Memoization to prevent unnecessary re-renders
 * - Deterministic background per chat
 * - Proper cleanup of subscriptions
 * - Virtualized message list for performance
 * - Security improvements
 * - AI integration ready
 */
function ChatContainer() {
  const {
    selectedUser,
    selectedGroup,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    setSelectedGroup,
    typingUsers,
    reactToMessage,
    markMessagesAsRead,
  } = useChatStore();
  
  const {
    groupMessages,
    getGroupMessages,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    currentGroup,
  } = useGroupStore();
  
  const { authUser } = useAuthStore();
  const { startCall } = useCallStore();
  const { blockedUsers, getBlockedUsers, checkFriendship, friendshipStatusByUser } = useFriendStore();
  
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(null);
  const [reactionMenuOpen, setReactionMenuOpen] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  // Memoized computed values
  const isGroupChat = useMemo(() => !!selectedGroup, [selectedGroup]);
  const currentMessages = useMemo(() => 
    isGroupChat ? groupMessages : messages, 
    [isGroupChat, groupMessages, messages]
  );
  const currentChat = useMemo(() => 
    isGroupChat ? (currentGroup || selectedGroup) : selectedUser,
    [isGroupChat, currentGroup, selectedGroup, selectedUser]
  );
  
  const isBlocked = useMemo(() => 
    !isGroupChat && selectedUser
      ? blockedUsers.some((user) => user._id === selectedUser._id)
      : false,
    [isGroupChat, selectedUser, blockedUsers]
  );
  
  const isBlockedByOther = useMemo(() =>
    !isGroupChat && selectedUser
      ? !!friendshipStatusByUser[selectedUser._id]?.isBlockedByOther
      : false,
    [isGroupChat, selectedUser, friendshipStatusByUser]
  );
  
  const isConversationBlocked = useMemo(() => 
    isBlocked || isBlockedByOther,
    [isBlocked, isBlockedByOther]
  );
  
  const isAdmin = useMemo(() => 
    isGroupChat && currentChat ? isUserAdmin(currentChat, authUser._id) : false,
    [isGroupChat, currentChat, authUser._id]
  );

  // Deterministic background based on chat ID
  const backgroundImage = useChatBackground(currentChat?._id);

  // Handle message subscriptions with proper cleanup
  useMessageSubscriptions({
    isGroupChat,
    selectedUser,
    selectedGroup,
    isConversationBlocked,
    getMessagesByUserId,
    getGroupMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  });

  // Load blocked users and friendship status
  useEffect(() => {
    if (!isGroupChat && selectedUser) {
      getBlockedUsers();
      checkFriendship(selectedUser._id);
    }
  }, [isGroupChat, selectedUser, getBlockedUsers, checkFriendship]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (selectedUser && !isGroupChat && messages.length > 0 && !isConversationBlocked) {
      const unreadCount = messages.filter(
        (m) => m.senderId === selectedUser._id && (!m.readBy || !m.readBy.includes(authUser._id))
      ).length;
      
      if (unreadCount > 0) {
        // Debounce marking as read
        const timer = setTimeout(() => {
          markMessagesAsRead(selectedUser._id);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [messages.length, selectedUser, isGroupChat, authUser._id, isConversationBlocked, markMessagesAsRead]);

  // Memoized callbacks to prevent re-renders
  const handleReactionToggle = useCallback((messageId) => {
    setReactionMenuOpen(prev => prev === messageId ? null : messageId);
    setDeleteMenuOpen(null);
  }, []);

  const handleReactionClick = useCallback((messageId, emoji) => {
    reactToMessage(messageId, emoji);
    setReactionMenuOpen(null);
  }, [reactToMessage]);

  const handleDeleteToggle = useCallback((messageId) => {
    setDeleteMenuOpen(prev => prev === messageId ? null : messageId);
    setReactionMenuOpen(null);
  }, []);

  const handleDeleteMessage = useCallback(async (messageId, deleteForEveryone) => {
    await deleteMessage(messageId, deleteForEveryone);
    setDeleteMenuOpen(null);
  }, [deleteMessage]);

  const handleCallBack = useCallback((callType) => {
    startCall(selectedUser, callType);
  }, [selectedUser, startCall]);

  const handleGroupInfoToggle = useCallback(() => {
    setShowGroupInfo(prev => !prev);
  }, []);

  const handleGroupClose = useCallback(() => {
    setSelectedGroup(null);
  }, [setSelectedGroup]);

  return (
    <div 
      className="flex flex-col h-full relative"
      style={{
        backgroundImage: `linear-gradient(rgba(7, 7, 12, 0.65), rgba(7, 7, 12, 0.65)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <ChatHeader 
        group={isGroupChat ? currentChat : null}
        onBack={isGroupChat ? handleGroupClose : null}
        onSettingsClick={isGroupChat ? handleGroupInfoToggle : null}
        isAdmin={isAdmin}
      />
      
      <div 
        className="flex-1 px-4 overflow-y-auto py-6 custom-scrollbar flex flex-col relative"
      >
        {isConversationBlocked ? (
          <BlockedConversationPlaceholder 
            isBlockedByOther={isBlockedByOther}
          />
        ) : currentMessages.length > 0 && !isMessagesLoading ? (
          <MessageList
            messages={currentMessages}
            isGroupChat={isGroupChat}
            selectedUser={selectedUser}
            selectedGroup={selectedGroup}
            authUser={authUser}
            typingUsers={typingUsers}
            reactionMenuOpen={reactionMenuOpen}
            deleteMenuOpen={deleteMenuOpen}
            onReactionToggle={handleReactionToggle}
            onReactionClick={handleReactionClick}
            onDeleteToggle={handleDeleteToggle}
            onDeleteMessage={handleDeleteMessage}
            onCallBack={handleCallBack}
          />
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <EmptyChatPlaceholder 
            isGroupChat={isGroupChat}
            currentChat={currentChat}
          />
        )}
      </div>

      <MessageInput />

      {/* Group Info Sidebar */}
      {isGroupChat && showGroupInfo && currentChat && (
        <GroupInfoSidebar 
          group={currentChat}
          onClose={() => setShowGroupInfo(false)}
        />
      )}
    </div>
  );
}

/**
 * BlockedConversationPlaceholder Component
 * Displays message when conversation is blocked
 */
const BlockedConversationPlaceholder = memo(({ isBlockedByOther }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-in fade-in duration-500">
    <div className="bg-red-500/10 rounded-full p-8 mb-6 backdrop-blur-sm border border-red-500/20">
      <BanIcon className="w-16 h-16 text-red-400 opacity-80" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-3">
      {isBlockedByOther ? "You are blocked" : "User blocked"}
    </h3>
    <p className="text-gray-400 max-w-md leading-relaxed">
      {isBlockedByOther
        ? "This user has blocked you. You can't see or send messages."
        : "You have blocked this user. Unblock them to resume messaging."}
    </p>
  </div>
));

BlockedConversationPlaceholder.displayName = 'BlockedConversationPlaceholder';

/**
 * EmptyChatPlaceholder Component
 * Displays placeholder for empty conversations
 */
const EmptyChatPlaceholder = memo(({ isGroupChat, currentChat}) => {
  if (isGroupChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-[#facc15]/10 to-[#d4af37]/5 rounded-full p-10 mb-6 backdrop-blur-sm border border-[#facc15]/20">
          <UsersIcon className="w-20 h-20 text-[#facc15] opacity-60" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Start the conversation</h3>
        <p className="text-gray-400 max-w-md leading-relaxed">
          Send the first message to <span className="text-[#facc15] font-semibold">{currentChat?.name}</span>
        </p>
      </div>
    );
  }
  
  return <NoChatHistoryPlaceholder name={currentChat?.fullName} />;
});

EmptyChatPlaceholder.displayName = 'EmptyChatPlaceholder';

export default memo(ChatContainer);
