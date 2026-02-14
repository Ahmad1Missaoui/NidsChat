import { memo } from 'react';
import { SmilePlusIcon } from 'lucide-react';

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

/**
 * ReactionMenu Component
 * Displays reaction picker popover
 */
const ReactionMenu = memo(({ 
  messageId, 
  isOpen, 
  isSender, 
  onReact, 
  onToggle 
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(messageId);
        }}
        className="p-1.5 rounded-full bg-[#14141c]/80 border border-[#2a2a34] text-[#facc15] hover:bg-[#1a1a24] backdrop-blur-sm transition-all shadow-lg"
        title="Add reaction"
      >
        <SmilePlusIcon className="w-3.5 h-3.5" />
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
        className="p-1.5 rounded-full bg-[#1a1a24] border border-[#facc15] text-[#facc15] backdrop-blur-sm transition-all shadow-lg"
      >
        <SmilePlusIcon className="w-3.5 h-3.5" />
      </button>
      
      <div 
        className={`absolute bottom-full mb-2 bg-[#1a1a24] border border-[#2a2a34] rounded-full p-1.5 flex gap-1 shadow-xl z-50 animate-in fade-in zoom-in duration-200 ${
          isSender ? 'right-0' : 'left-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReact(messageId, emoji)}
            className="p-1.5 hover:bg-[#2a2a34] rounded-full transition-transform hover:scale-125 text-lg leading-none"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
});

ReactionMenu.displayName = 'ReactionMenu';

export default ReactionMenu;
