import { memo } from 'react';
import { TrashIcon, Trash2Icon, BanIcon } from 'lucide-react';

/**
 * MessageActions Component
 * Displays delete menu for message sender
 */
const MessageActions = memo(({ 
  messageId, 
  isOpen, 
  isSender, 
  onDelete, 
  onToggle 
}) => {
  if (!isSender) return null;

  if (!isOpen) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(messageId);
        }}
        className="p-1.5 rounded-full bg-[#14141c]/80 border border-[#2a2a34] text-red-400 hover:bg-[#1a1a24] backdrop-blur-sm transition-all shadow-lg"
        title="Delete message"
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(null);
        }}
        className="p-1.5 rounded-full bg-[#1a1a24] border border-red-500/50 text-red-400 backdrop-blur-sm transition-all shadow-lg"
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>

      <div 
        className={`absolute top-full mt-2 w-44 bg-[#14141c] border border-[#2a2a34] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
          isSender ? 'right-0' : 'left-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onDelete(messageId, false)}
          className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#1a1a24] transition-colors flex items-center gap-2"
        >
          <Trash2Icon className="w-4 h-4" />
          Delete for me
        </button>
        <button
          onClick={() => onDelete(messageId, true)}
          className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-[#2a2a34]"
        >
          <BanIcon className="w-4 h-4" />
          Delete for everyone
        </button>
      </div>
    </div>
  );
});

MessageActions.displayName = 'MessageActions';

export default MessageActions;
