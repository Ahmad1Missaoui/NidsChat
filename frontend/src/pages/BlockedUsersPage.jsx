import { useEffect, useState } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { BanIcon, ShieldOffIcon, LoaderIcon, ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router";

function BlockedUsersPage() {
  const navigate = useNavigate();
  const { blockedUsers, getBlockedUsers, unblockUser } = useFriendStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlocked = async () => {
      await getBlockedUsers();
      setIsLoading(false);
    };
    fetchBlocked();
  }, [getBlockedUsers]);

  const handleUnblock = async (userId, userName) => {
    if (confirm(`Are you sure you want to unblock ${userName}?`)) {
      await unblockUser(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-[#0c0c12] to-[#14141c]">
        <div className="flex justify-center items-center h-full">
          <LoaderIcon className="w-8 h-8 animate-spin text-[#facc15]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#0c0c12] to-[#14141c] relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-[0.35]"
        style={{ backgroundImage: 'url(/blocked.jpg)', backgroundAttachment: 'fixed' }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-[#0c0c12]/70 via-[#14141c]/60 to-[#0c0c12]/70" />
      {/* Animated Overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/6 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/6 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        <div className="max-w-2xl mx-auto mb-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#facc15]/10 to-[#d4af37]/10 hover:from-[#facc15]/20 hover:to-[#d4af37]/20 border border-[#facc15]/30 hover:border-[#facc15]/50 rounded-xl text-[#facc15] transition-all duration-300 group backdrop-blur-sm shadow-lg hover:shadow-[#facc15]/20"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back</span>
          </button>

          <h1 className="text-3xl font-black bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(239,68,68,0.3)] mb-2">
            Blocked Users
          </h1>
          <p className="text-sm text-gray-300 font-medium">
            {blockedUsers.length} {blockedUsers.length === 1 ? 'user' : 'users'} blocked
          </p>
        </div>
        
        {blockedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-full p-8 mb-6 shadow-lg shadow-red-500/5">
              <BanIcon className="w-16 h-16 text-red-400 opacity-50" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Blocked Users</h2>
            <p className="text-gray-400 max-w-md">
              You haven't blocked anyone yet. Blocked users won't be able to contact you.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {blockedUsers.map((user) => (
              <div
                key={user._id}
                className="bg-gradient-to-br from-[#14141c]/90 to-[#1a1a24]/90 backdrop-blur-md border-2 border-red-500/15 rounded-2xl p-6 hover:border-red-500/40 transition-all duration-500 shadow-2xl shadow-black/50 hover:shadow-red-500/20 transform hover:scale-[1.02] hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="w-16 h-16 rounded-full border-3 border-red-500/60 object-cover ring-4 ring-red-500/10 group-hover:ring-red-500/30 transition-all duration-300 grayscale"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
                        <BanIcon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg truncate">{user.fullName}</h3>
                      <p className="text-gray-400 text-sm truncate">@{user.username}</p>
                      <p className="text-red-400 text-xs mt-1 font-semibold">BLOCKED</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(user._id, user.fullName)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-xl flex items-center gap-2 transition-all duration-300 font-bold shadow-xl hover:shadow-green-500/30 transform hover:scale-110 active:scale-95"
                  >
                    <ShieldOffIcon className="w-5 h-5" />
                    Unblock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockedUsersPage;
