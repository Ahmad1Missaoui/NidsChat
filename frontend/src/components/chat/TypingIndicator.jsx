import { memo } from 'react';

/**
 * TypingIndicator Component
 * Displays animated typing dots like WhatsApp
 */
const TypingIndicator = memo(({ isGroupChat, selectedGroup, selectedUser, typingUsers }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  const isTyping = typingUsers.some(u => 
    isGroupChat 
      ? u.chatId === selectedGroup?._id 
      : u.chatId === selectedUser?._id
  );

  if (!isTyping) return null;

  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300 ml-11 mb-2">
      <div className="bg-gray-100 dark:bg-[rgba(12,12,18,0.82)] border border-[#e5e7eb] dark:border-[rgba(255,255,255,0.05)] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 shadow-sm">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-500 dark:bg-[#facc15] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-gray-500 dark:bg-[#facc15] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-gray-500 dark:bg-[#facc15] rounded-full animate-bounce"></span>
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-300">typing...</span>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;
