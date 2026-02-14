import { memo, useState } from 'react';
import { 
  FileIcon, 
  DownloadIcon, 
  PhoneMissedIcon, 
  VideoIcon, 
  PhoneCallIcon,
  CheckCheckIcon,
  SparklesIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import ReactionMenu from './ReactionMenu';
import MessageActions from './MessageActions';
import AIAssistantButton from './AIAssistantButton';
import TranslateButton from './TranslateButton';
import { formatMessageTime } from '../../utils/chatHelpers';
import { isValidUrl } from '../../utils/security';

/**
 * MessageBubble Component
 * Renders individual message with all content types
 * Memoized to prevent unnecessary re-renders
 */
const MessageBubble = memo(({ 
  message,
  isSender,
  isGroupChat,
  senderInfo,
  authUser,
  reactionMenuOpen,
  deleteMenuOpen,
  onReactionToggle,
  onReactionClick,
  onDeleteToggle,
  onDeleteMessage,
  onCallBack
}) => {
  const msg = message;
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 350;
  const shouldTruncate = msg.text && msg.text.length > MAX_LENGTH;

  return (
    <div
      key={msg._id}
      className={`flex ${isSender ? "justify-end" : "justify-start"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className={`flex gap-3 max-w-[72%] ${isSender ? "flex-row-reverse" : ""}`}>

        {/* Avatar for received messages */}
        {!isSender && (
          <img
            src={senderInfo?.profilePic || "/avatar.png"}
            alt={senderInfo?.fullName || "User"}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-[#facc15]/30 shadow-lg"
          />
        )}
        
        <div className={`flex flex-col ${isSender ? "items-end" : "items-start"} relative`}>
          
          {/* Sender name for group messages */}
          {isGroupChat && !isSender && (
            <span className="text-xs text-[#facc15] font-medium mb-1 tracking-wide">
              {senderInfo?.fullName || "Unknown"}
            </span>
          )}
          
          {/* Timestamp */}
          <span className="text-[11px] text-[#9aa0a6] mb-1.5 tracking-wide">
            {formatMessageTime(msg.createdAt)}
          </span>
          
          {/* Message Actions (Reactions, Translate & Delete) - Hover to show */}
          {!msg.isDeleted && msg.text && (
            <div className={`absolute -top-2 ${
              isSender ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"
            } opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-1`}>
              
              <ReactionMenu
                messageId={msg._id}
                isOpen={reactionMenuOpen === msg._id}
                isSender={isSender}
                onReact={onReactionClick}
                onToggle={onReactionToggle}
              />

              <TranslateButton messageText={msg.text} />

              <MessageActions
                messageId={msg._id}
                isOpen={deleteMenuOpen === msg._id}
                isSender={isSender}
                onDelete={onDeleteMessage}
                onToggle={onDeleteToggle}
              />
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`relative rounded-[18px] px-4 py-2.5 backdrop-blur-md transition-all duration-200 break-words whitespace-pre-wrap ${
              msg.isDeleted
                ? "bg-[#1a1a24]/50 text-gray-400 border border-[#2a2a34] italic"
                : isSender
                ? "bg-gradient-to-br from-[#f5d9b8] to-[#edc09a] text-[#2b1d0f] shadow-[0_4px_12px_rgba(212,175,55,0.2)] border border-[#eab889]/30"
                : "bg-white/90 text-[#1f2937] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#e5e7eb]/50 backdrop-blur-sm"
            }`}
          >
            {/* Tail/Pointer */}
            {!msg.isDeleted && (
              <span
                className={`absolute bottom-2 ${isSender ? "-right-1" : "-left-1"} size-3 rotate-45 rounded-sm ${
                  isSender 
                    ? "bg-gradient-to-br from-[#f5d9b8] to-[#edc09a] border-r border-b border-[#eab889]/30" 
                    : "bg-white/90 border-l border-t border-[#e5e7eb]/50"
                }`}
              />
            )}

            {/* Image */}
            {msg.image && !msg.isDeleted && isValidUrl(msg.image) && (
              <img
                src={msg.image}
                alt="attachment"
                className="max-w-xs rounded-xl mb-2 border border-black/5"
                loading="lazy"
              />
            )}
            
            {/* Video */}
            {msg.video && !msg.isDeleted && isValidUrl(msg.video) && (
              <video
                src={msg.video}
                controls
                className="max-w-xs rounded-xl mb-2 border border-black/5"
                preload="metadata"
              />
            )}
            
            {/* Document */}
            {msg.document && !msg.isDeleted && isValidUrl(msg.document) && (
              <div className="space-y-2 mb-2">
                <a
                  href={msg.document}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] ${
                    isSender 
                      ? "bg-[#f2e2d4] border-[#ecd2be] hover:bg-[#f0dcc8]" 
                      : "bg-white/80 border-[#e5e7eb] hover:bg-white"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-[#facc15]/20">
                    <FileIcon className="w-5 h-5 text-[#b8860b]" />
                  </div>
                  <span className="text-sm flex-1 truncate font-medium">
                    {msg.documentName || 'Document'}
                  </span>
                  <DownloadIcon className="w-4 h-4 text-gray-500" />
                </a>
                
                {/* AI Document Summarization Button */}
                <AIAssistantButton 
                  documentUrl={msg.document} 
                  documentName={msg.documentName || 'Document'} 
                />
              </div>
            )}
            
            {/* Voice Message */}
            {msg.voice && !msg.isDeleted && isValidUrl(msg.voice) && (
              <VoiceMessagePlayer src={msg.voice} isSender={isSender} />
            )}
            
            {/* Missed Call */}
            {msg.missedCall && !msg.isDeleted && (
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-2">
                <div className="p-2 rounded-full bg-red-500/20">
                  {msg.callType === 'video' ? (
                    <VideoIcon className="w-5 h-5 text-red-400" />
                  ) : (
                    <PhoneMissedIcon className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400">
                    {isSender ? 'Call not answered' : 'Missed call'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {msg.callType === 'video' ? 'Video call' : 'Voice call'}
                  </p>
                </div>
                {!isSender && onCallBack && (
                  <button
                    onClick={() => onCallBack(msg.callType)}
                    className="p-2 rounded-full bg-gradient-to-r from-[#facc15] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b8860b] shadow-lg transition-all transform hover:scale-110"
                    title="Call back"
                  >
                    <PhoneCallIcon className="w-4 h-4 text-black" />
                  </button>
                )}
              </div>
            )}
            
            {/* AI Response Indicator */}
            {msg.isAIResponse && (
              <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <SparklesIcon className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wide">
                  AI Response
                </span>
              </div>
            )}
            
            {/* Text Content */}
            {msg.text && (
              <div className="min-w-[80px]">
                <p className="break-words break-all text-[15px] leading-relaxed whitespace-pre-wrap overflow-hidden" 
                   style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {shouldTruncate && !isExpanded 
                    ? msg.text.slice(0, MAX_LENGTH) + "..." 
                    : msg.text}
                </p>
                
                {shouldTruncate && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`text-xs font-semibold mt-1 flex items-center gap-1 hover:underline focus:outline-none transition-colors ${
                      isSender ? "text-[#543b23] hover:text-[#2b1d0f]" : "text-blue-500 hover:text-blue-700"
                    }`}
                  >
                    {isExpanded ? (
                      <>Read less <ChevronUp className="size-3" /></>
                    ) : (
                      <>Read more <ChevronDown className="size-3" /></>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Read Receipt (Double Tick) */}
            {isSender && !msg.isDeleted && (
              <div className="flex items-center justify-end gap-1 mt-1">
                <CheckCheckIcon 
                  className={`w-4 h-4 transition-colors ${
                    msg.readBy && msg.readBy.length > 0
                      ? "text-blue-500"
                      : "text-gray-400"
                  }`}
                  title={msg.readBy && msg.readBy.length > 0 ? "Read" : "Delivered"}
                />
              </div>
            )}

            {/* Reactions Display */}
            {msg.reactions && msg.reactions.length > 0 && (
              <div className={`absolute -bottom-2 ${isSender ? "left-2" : "right-2"} flex -space-x-1`}>
                {msg.reactions.slice(0, 5).map((r, i) => (
                  <span 
                    key={i} 
                    className="bg-[#14141c] border-2 border-[#2a2a34] rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg z-10 hover:scale-125 transition-transform cursor-default" 
                    title={r.userId?.fullName || 'User'}
                  >
                    {r.emoji}
                  </span>
                ))}
                {msg.reactions.length > 5 && (
                  <span className="bg-[#14141c] border-2 border-[#2a2a34] rounded-full px-2 h-6 flex items-center justify-center text-[9px] text-gray-400 font-semibold shadow-lg z-0">
                    +{msg.reactions.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
