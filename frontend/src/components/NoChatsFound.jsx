import React from 'react'

import { MessageCircleIcon, UserSearchIcon } from "lucide-react";
import { useNavigate } from "react-router";

function NoChatsFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-[rgba(8,8,12,0.7)] rounded-2xl border border-[rgba(212,175,55,0.18)] px-6 shadow-[0_0_30px_rgba(212,175,55,0.16)]">
      <div className="w-16 h-16 bg-gradient-to-br from-[#facc15]/24 to-[#d4af37]/10 rounded-full flex items-center justify-center">
        <MessageCircleIcon className="w-8 h-8 text-[#facc15]" />
      </div>
      <div>
        <h4 className="text-white font-semibold mb-1 tracking-wide">No conversations yet</h4>
        <p className="text-[#9ca3af] text-sm px-6">
          Start a new chat by selecting a contact from the contacts tab
        </p>
      </div>
      <button
        onClick={() => navigate("/search")}
        className="px-5 py-2.5 text-sm font-semibold text-[#0b0b0f] bg-gradient-to-r from-[#facc15] to-[#d4af37] rounded-xl hover:shadow-[0_10px_30px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
      >
        <UserSearchIcon className="w-4 h-4" />
        Find Contacts
      </button>
    </div>
  );
}
export default NoChatsFound;