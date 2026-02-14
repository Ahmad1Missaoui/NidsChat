import { useState } from "react";
import { Search, UserPlus, Check, Loader, ArrowLeft, Clock, XCircle, UserCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../lib/axios";
import { useFriendStore } from "../store/useFriendStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";

function UserSearchPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requestStatus, setRequestStatus] = useState({});
  const { sendFriendRequest } = useFriendStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    try {
      const res = await axiosInstance.get(`/users/search?query=${searchQuery}`);
      setSearchResults(res.data);
      
      // Check friendship status for each user
      const statusChecks = await Promise.all(
        res.data.map(async (user) => {
          try {
            const statusRes = await axiosInstance.get(`/friends/check/${user._id}`);
            return [user._id, statusRes.data];
          } catch {
            return [user._id, null];
          }
        })
      );
      setRequestStatus(Object.fromEntries(statusChecks));
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId) => {
    const success = await sendFriendRequest(userId);
    if (success) {
      setRequestStatus((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], requestSent: true },
      }));
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#121212] overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0b0b0f] rounded-none md:rounded-l-[40px] overflow-hidden shadow-2xl relative z-10 my-0 mr-0 border-0 md:border-l md:border-white/5 h-full pt-16 md:pt-0">
        {/* Header */}
        <div className="h-auto md:h-20 border-b border-gray-100 dark:border-[rgba(255,255,255,0.05)] bg-white dark:bg-[#0b0b0f] px-4 md:px-8 py-4 md:py-0 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">{t('user_search.title')}</h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{t('user_search.subtitle')}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-8 py-4 md:py-6 bg-white dark:bg-[#0b0b0f] flex-shrink-0">
          <form onSubmit={handleSearch}>
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('user_search.search_placeholder')}
                className="w-full bg-gray-100 dark:bg-[#18181b] border-none rounded-2xl py-3 pl-12 pr-28 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-[15px] focus:ring-1 focus:ring-amber-400/50 transition-all outline-none"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 md:px-5 py-1.5 bg-amber-500 hover:bg-amber-600 dark:bg-[#facc15] dark:hover:bg-[#d4af37] text-white dark:text-black rounded-lg font-semibold text-xs md:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? <Loader className="size-4 animate-spin" /> : t('user_search.search_button')}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#0b0b0f] px-4 md:px-8 pb-8">
          {isSearching ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="size-8 animate-spin text-amber-500 dark:text-[#facc15]" />
            </div>
          ) : searchResults.length === 0 && searchQuery ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-60">
              <div className="w-20 h-20 bg-gray-100 dark:bg-[#18181b] rounded-full flex items-center justify-center mb-6">
                <XCircle className="size-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('user_search.no_results')}</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                {t('user_search.no_results_desc')}
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-60">
              <div className="w-20 h-20 bg-gray-100 dark:bg-[#18181b] rounded-full flex items-center justify-center mb-6">
                <Users className="size-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('user_search.start_search')}</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                {t('user_search.start_search_desc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {searchResults.map((user) => {
                const status = requestStatus[user._id];
                const isFriend = status?.isFriend;
                const requestSent = status?.requestSent;
                const requestReceived = status?.requestReceived;
                const isBlocked = status?.isBlocked;

                return (
                  <div
                    key={user._id}
                    className="bg-white dark:bg-[#18181b] border border-gray-100 dark:border-[rgba(255,255,255,0.05)] rounded-2xl p-5 hover:border-amber-400/30 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-full overflow-hidden border border-gray-100 dark:border-[rgba(255,255,255,0.1)] flex-shrink-0">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg truncate">
                          {user.fullName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                      
                    <div className="mt-4">
                        {isBlocked ? (
                          <div className="w-full py-2.5 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl font-medium text-sm flex items-center justify-center">
                            Blocked
                          </div>
                        ) : isFriend ? (
                          <div className="w-full py-2.5 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                            <UserCheck className="size-4" />
                            {t('user_search.already_friends')}
                          </div>
                        ) : requestSent ? (
                          <div className="w-full py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                            <Clock className="size-4" />
                            {t('user_search.request_pending')}
                          </div>
                        ) : requestReceived ? (
                          <button
                            onClick={() => navigate("/friend-requests")}
                            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-blue-500/20"
                          >
                            View Request
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(user._id)}
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 dark:bg-[#facc15] dark:hover:bg-[#d4af37] text-white dark:text-black rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-sm shadow-md shadow-amber-500/20"
                          >
                            <UserPlus className="size-4" />
                            {t('user_search.add_friend')}
                          </button>
                        )}
                      </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserSearchPage;
