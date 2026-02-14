import React from "react";
import { MessageCircleIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="size-20 bg-gradient-to-br from-[#facc15]/28 to-[#d4af37]/14 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
        <MessageCircleIcon className="size-10 text-[#facc15]" />
      </div>
      <h3 className="text-xl font-semibold text-white tracking-wide mb-2 uppercase">Select a conversation</h3>
      <p className="text-[#9ca3af] max-w-md">
        Choose a contact from the sidebar to start chatting or continue a previous conversation.
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;