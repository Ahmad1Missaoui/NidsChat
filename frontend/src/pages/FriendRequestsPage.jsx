import { useEffect, useState } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useTranslation } from "react-i18next";
import { UserPlus, Check, X, Loader, Search, Inbox, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";

function FriendRequestsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    friendRequests, 
    getFriendRequests, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    isLoadingRequests,
    clearUnreadRequests
  } = useFriendStore();

  useEffect(() => {
    getFriendRequests();
    clearUnreadRequests();
  }, [getFriendRequests, clearUnreadRequests]);

  const filteredRequests = friendRequests.filter(req =>
    req.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex bg-[#121212] overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0b0b0f] rounded-none md:rounded-l-[40px] overflow-hidden shadow-2xl relative z-10 my-0 mr-0 border-0 md:border-l md:border-white/5 h-full pt-16 md:pt-0">
        {/* Header */}
        <div className="h-auto md:h-20 border-b border-gray-100 dark:border-[rgba(255,255,255,0.05)] bg-white dark:bg-[#0b0b0f] px-4 md:px-8 py-4 md:py-0 flex items-center gap-4 flex-shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{t('friend_requests.title')}</h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {friendRequests.length} {t('friend_requests.pending')} {friendRequests.length === 1 ? t('friend_requests.request') : t('friend_requests.requests')}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-8 py-4 md:py-6 bg-white dark:bg-[#0b0b0f] flex-shrink-0">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
            <input
              type="text"
              placeholder={t('friend_requests.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#18181b] border-none rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-[15px] focus:ring-1 focus:ring-amber-400/50 transition-all outline-none"
            />
          </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#0b0b0f] px-4 md:px-8 pb-8">
           {isLoadingRequests ? (
              <div className="flex justify-center items-center h-full">
                <Loader className="size-8 animate-spin text-amber-500 dark:text-[#facc15]" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-60">
                <div className="w-20 h-20 bg-gray-100 dark:bg-[#18181b] rounded-full flex items-center justify-center mb-6">
                  <Inbox className="size-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? t('friend_requests.no_results') : t('friend_requests.no_requests')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  {searchQuery ? t('friend_requests.no_results_desc') : t('friend_requests.no_requests_desc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-white dark:bg-[#18181b] border border-gray-100 dark:border-[rgba(255,255,255,0.05)] rounded-2xl p-5 hover:border-amber-400/30 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative flex-shrink-0">
                        <div className="size-14 rounded-full overflow-hidden border border-gray-100 dark:border-[rgba(255,255,255,0.1)]">
                          <img
                            src={request.profilePic || "/avatar.png"}
                            alt={request.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 dark:bg-[#facc15] rounded-full p-1 border-2 border-white dark:border-[#18181b]">
                          <UserPlus className="size-3 text-white dark:text-black" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg truncate">
                          {request.fullName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{request.username}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => acceptFriendRequest(request._id)}
                        className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 dark:bg-[#facc15] dark:hover:bg-[#d4af37] text-white dark:text-black rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-sm shadow-md shadow-amber-500/20"
                      >
                        <Check className="size-4" />
                        {t('friend_requests.accept')}
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(request._id)}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#27272a] dark:hover:bg-[#3f3f46] text-gray-700 dark:text-white rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-sm"
                      >
                        <X className="size-4" />
                        {t('friend_requests.reject')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default FriendRequestsPage;
