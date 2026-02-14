import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";
import CreateGroupModal from "../components/CreateGroupModal";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router";
import { UsersIcon, Plus, Search, Loader, Users, MoreVertical } from "lucide-react";

function GroupsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { groups, getGroups, isLoading, setCurrentGroup } = useGroupStore();
  const { setSelectedGroup } = useChatStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getGroups();
  }, [getGroups]);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setCurrentGroup(group);
    navigate('/chats');
  };

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex bg-[#121212] overflow-hidden transition-colors duration-300">
      
      {/* SIDEBAR NAVIGATION */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex bg-white dark:bg-[#0b0b0f] rounded-none md:rounded-l-[40px] overflow-hidden shadow-2xl relative z-10 my-0 mr-0 border-0 md:border-l md:border-white/5 h-full pt-16 md:pt-0">
        
        {/* GROUPS LIST PANEL */}
        <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col border-r border-gray-100 dark:border-[rgba(255,255,255,0.05)] bg-white dark:bg-[#0b0b0f] h-full">
          
          {/* Header */}
          <div className="px-4 md:px-6 pt-4 md:pt-6 pb-4 flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{t('groups.title')}</h1>
            <div className="flex gap-2">
                 <button 
                  onClick={() => setShowCreateModal(true)}
                  className="p-2 bg-amber-100 dark:bg-[rgba(255,255,255,0.05)] text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-200 dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                  title={t('groups.create_new')}
                 >
                   <Plus className="size-5" />
                 </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 md:px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="text"
                placeholder={t('groups.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#18181b] border-none rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-[15px] focus:ring-1 focus:ring-amber-400/50 transition-all outline-none"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader className="size-8 animate-spin text-amber-500" />
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 opacity-60">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-[#18181b] rounded-full flex items-center justify-center mb-4">
                    <Users className="size-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('groups.no_groups')}</h3>
                  <p className="text-sm text-gray-500">{t('groups.no_groups_desc')}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {filteredGroups.map((group) => (
                    <div
                      key={group._id}
                      onClick={() => handleSelectGroup(group)}
                      className="p-3 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.03)] transition-all flex items-center gap-4 group"
                    >
                      <div className="relative flex-shrink-0">
                         <div className="size-12 rounded-full overflow-hidden border border-gray-100 dark:border-[rgba(255,255,255,0.05)]">
                           <img 
                              src={group.groupPic || "/groups.jpg"} 
                              alt={group.name} 
                              className="w-full h-full object-cover" 
                           />
                         </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{group.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {group.members?.length || 0} {t('groups.members')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* RIGHT SIDE PLACEHOLDER (Hidden on small screens) */}
        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50 dark:bg-[#121212]/50 text-center px-8">
            <div className="w-24 h-24 bg-amber-100 dark:bg-[rgba(212,175,55,0.1)] rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Users className="size-10 text-amber-600 dark:text-[#facc15]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('groups.select_group')}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {t('groups.select_group_desc')}
            </p>
        </div>

      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}
    </div>
  );
}

export default GroupsPage;
