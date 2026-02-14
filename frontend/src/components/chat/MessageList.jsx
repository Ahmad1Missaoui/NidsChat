import { memo, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { isMessageFromUser } from '../../utils/chatHelpers';

/**
 * MessageList Component
 * Optimized message list with smooth scrolling and auto-scroll behavior
 * Future: Can be enhanced with virtualization for 1000+ messages
 */
const MessageList = memo(({ 
  messages,
  isGroupChat,
  selectedUser,
  selectedGroup,
  authUser,
  typingUsers,
  reactionMenuOpen,
  deleteMenuOpen,
  onReactionToggle,
  onReactionClick,
  onDeleteToggle,
  onDeleteMessage,
  onCallBack
}) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  return (
    <div className="w-full px-2 md:px-6 space-y-3 mt-auto pb-4 pt-4">
      {messages.map((msg) => {
        const isSender = isMessageFromUser(msg, authUser._id, isGroupChat);
        const senderInfo = isGroupChat && !isSender ? msg.sender : selectedUser;

        return (
          <MessageBubble
            key={msg._id}
            message={msg}
            isSender={isSender}
            isGroupChat={isGroupChat}
            senderInfo={senderInfo}
            authUser={authUser}
            reactionMenuOpen={reactionMenuOpen}
            deleteMenuOpen={deleteMenuOpen}
            onReactionToggle={onReactionToggle}
            onReactionClick={onReactionClick}
            onDeleteToggle={onDeleteToggle}
            onDeleteMessage={onDeleteMessage}
            onCallBack={onCallBack}
          />
        );
      })}
      
      <TypingIndicator
        isGroupChat={isGroupChat}
        selectedGroup={selectedGroup}
        selectedUser={selectedUser}
        typingUsers={typingUsers}
      />
      
      {/* Scroll anchor */}
      <div ref={scrollRef} />
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
