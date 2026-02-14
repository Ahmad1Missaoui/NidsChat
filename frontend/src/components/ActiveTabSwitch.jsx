import React from 'react'
import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="tabs tabs-boxed bg-transparent p-3 m-3 rounded-2xl border border-gray-200 dark:border-[rgba(212,175,55,0.2)] shadow-sm dark:shadow-[0_0_18px_rgba(212,175,55,0.18)] flex">
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab flex-1 py-2 rounded-xl transition-all duration-300 font-medium ${
          activeTab === "chats"
            ? "bg-amber-100 dark:bg-[rgba(212,175,55,0.14)] text-amber-800 dark:text-[#facc15] shadow-sm dark:shadow-[0_0_14px_rgba(212,175,55,0.3)]"
            : "text-gray-500 dark:text-[#9ca3af] hover:text-gray-700 dark:hover:text-[#facc15]/70"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`tab flex-1 py-2 rounded-xl transition-all duration-300 font-medium ${
          activeTab === "contacts"
            ? "bg-amber-100 dark:bg-[rgba(212,175,55,0.14)] text-amber-800 dark:text-[#facc15] shadow-sm dark:shadow-[0_0_14px_rgba(212,175,55,0.3)]"
            : "text-gray-500 dark:text-[#9ca3af] hover:text-gray-700 dark:hover:text-[#facc15]/70"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;