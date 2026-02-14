import { BellIcon } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";
import { useNavigate } from "react-router";

function NotificationBell() {
  const navigate = useNavigate();
  const { unreadRequestsCount } = useFriendStore();

  return (
    <button
      onClick={() => navigate("/friend-requests")}
      className="relative p-2 hover:bg-white/5 rounded-lg transition-colors group"
      title="Friend Requests"
    >
      <BellIcon className="w-6 h-6 text-gray-400 group-hover:text-[#facc15] transition-colors" />
      {unreadRequestsCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {unreadRequestsCount > 9 ? '9+' : unreadRequestsCount}
        </span>
      )}
    </button>
  );
}

export default NotificationBell;
