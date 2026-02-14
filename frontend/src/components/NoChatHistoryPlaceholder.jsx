import { MessageCircleIcon } from "lucide-react";

const NoChatHistoryPlaceholder = ({ name }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 bg-gradient-to-br from-[#facc15]/30 to-[#d4af37]/10 rounded-full flex items-center justify-center mb-5 shadow-[0_0_26px_rgba(212,175,55,0.28)]">
        <MessageCircleIcon className="size-8 text-[#facc15]" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-3 tracking-wide">
        Start your conversation with {name}
      </h3>
      <div className="flex flex-col space-y-3 max-w-md mb-5">
        <p className="text-[#9ca3af] text-sm">
          This is the beginning of your conversation. Send a message to start chatting!
        </p>
        <div className="gold-divider w-32 mx-auto"></div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <button className="px-4 py-2 text-xs font-semibold text-[#0b0b0f] bg-gradient-to-r from-[#facc15] to-[#d4af37] rounded-full hover:shadow-[0_0_18px_rgba(212,175,55,0.25)] transition-all">
          👋 Say Hello
        </button>
        <button className="px-4 py-2 text-xs font-semibold text-[#facc15] bg-[rgba(12,12,18,0.8)] border border-[rgba(212,175,55,0.25)] rounded-full hover:bg-[rgba(212,175,55,0.12)] transition-all">
          🤝 How are you?
        </button>
        <button className="px-4 py-2 text-xs font-semibold text-[#facc15] bg-[rgba(12,12,18,0.8)] border border-[rgba(212,175,55,0.25)] rounded-full hover:bg-[rgba(212,175,55,0.12)] transition-all">
          📅 Meet up soon?
        </button>
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;