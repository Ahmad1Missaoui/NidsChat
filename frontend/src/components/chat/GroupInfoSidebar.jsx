import { useState, useEffect, memo } from 'react';
import { 
  X, 
  Plus, 
  Search, 
  Loader, 
  Users, 
  LogOut, 
  Trash2,
  UserMinus,
  Settings,
  Bell,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useGroupStore } from '../../store/useGroupStore';
import { useChatStore } from '../../store/useChatStore';
import { isUserAdmin } from '../../utils/chatHelpers';

/**
 * GroupInfoSidebar Component
 * Displays group details, members, and management options
 */
const GroupInfoSidebar = memo(({ group, onClose }) => {
  const { authUser } = useAuthStore();
  const { removeMember, addMember, leaveGroup, deleteGroup } = useGroupStore();
  const { setSelectedGroup } = useChatStore();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const isAdmin = isUserAdmin(group, authUser._id);

  const handleLeaveGroup = async () => {
    if (confirm(`Are you sure you want to leave ${group?.name}?`)) {
      const success = await leaveGroup(group._id);
      if (success) {
        setSelectedGroup(null);
        onClose();
      }
    }
  };

  const handleDeleteGroup = async () => {
    const success = await deleteGroup(group._id);
    if (success) {
      setShowDeleteModal(false);
      setSelectedGroup(null);
      onClose();
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (confirm(`Remove ${memberName} from the group?`)) {
      await removeMember(group._id, memberId);
    }
  };

  const handleAddMember = async (userId) => {
    const success = await addMember(group._id, userId);
    if (success) {
      setShowAddMemberModal(false);
      setSearchQuery("");
      setAvailableUsers([]);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setAvailableUsers([]);
      return;
    }
    
    setIsLoadingUsers(true);
    try {
      const { default: axiosInstance } = await import("../../lib/axios");
      const res = await axiosInstance.get("/messages/contacts");
      
      const filtered = res.data.filter(
        (user) => !group?.members?.some((member) => member._id === user._id)
      ).filter(
        (user) => 
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setAvailableUsers(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (showAddMemberModal) {
      searchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, showAddMemberModal]);

  return (
    <>
      <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-[#0b0b0f] border-l border-gray-200 dark:border-[rgba(212,175,55,0.15)] overflow-y-auto z-20 shadow-xl dark:shadow-[rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#0b0b0f] border-b border-gray-200 dark:border-[rgba(212,175,55,0.15)] px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Group Info</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            title="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        
        {/* Group Details */}
        <div className="p-6 border-b border-gray-200 dark:border-[rgba(212,175,55,0.15)]">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img
                src={group?.groupPic || "/avatar.png"}
                alt={group?.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-[rgba(212,175,55,0.3)] shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 dark:bg-[#facc15] rounded-full p-2 shadow-lg">
                <Users className="size-4 text-white dark:text-black" />
              </div>
            </div>
            
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{group?.name}</h4>
            
            {group?.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">{group.description}</p>
            )}
            
            <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-gray-100 dark:bg-[rgba(212,175,55,0.1)] rounded-full">
              <Users className="size-4 text-gray-600 dark:text-[#facc15]" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {group?.members?.length} {group?.members?.length === 1 ? 'member' : 'members'}
              </span>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="size-4" />
              Members
            </h5>
            {isAdmin && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-[#facc15] dark:hover:bg-[#d4af37] text-white dark:text-black transition-all shadow-md"
                title="Add Member"
              >
                <Plus className="size-4" />
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {group?.members?.map((member) => {
              const isMemberAdmin = isUserAdmin(group, member._id);
              const isCurrentUser = member._id === authUser._id;
              
              return (
                <div
                  key={member._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[rgba(255,255,255,0.02)] hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] border border-transparent hover:border-gray-200 dark:hover:border-[rgba(212,175,55,0.2)] group/member transition-all"
                >
                  <img
                    src={member.profilePic || "/avatar.png"}
                    alt={member.fullName}
                    className="size-11 rounded-full object-cover border-2 border-gray-200 dark:border-[rgba(212,175,55,0.2)]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white font-semibold text-sm truncate">
                      {member.fullName}
                      {isCurrentUser && <span className="text-gray-500 dark:text-gray-400 ml-1 font-normal">(You)</span>}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs truncate">@{member.username}</p>
                  </div>
                  {isMemberAdmin && (
                    <span className="flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-[rgba(212,175,55,0.2)] text-amber-800 dark:text-[#facc15] px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                      <Shield className="size-3" />
                      Admin
                    </span>
                  )}
                  {isAdmin && !isMemberAdmin && !isCurrentUser && (
                    <button
                      onClick={() => handleRemoveMember(member._id, member.fullName)}
                      className="opacity-0 group-hover/member:opacity-100 p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 transition-all"
                      title="Remove Member"
                    >
                      <UserMinus className="size-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-3 border-t border-gray-200 dark:border-[rgba(212,175,55,0.15)]">
          <button
            onClick={handleLeaveGroup}
            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)] border border-gray-300 dark:border-[rgba(212,175,55,0.2)] text-gray-700 dark:text-white rounded-xl flex items-center justify-center gap-2 transition-all font-semibold"
          >
            <LogOut className="size-5" />
            Leave Group
          </button>
          
          {isAdmin && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              <Trash2 className="size-5" />
              Delete Group
            </button>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0b0b0f] border border-gray-200 dark:border-[rgba(212,175,55,0.3)] rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[rgba(212,175,55,0.2)]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Member</h3>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSearchQuery("");
                  setAvailableUsers([]);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#facc15] size-5" />
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#18181b] border border-gray-300 dark:border-[rgba(212,175,55,0.2)] rounded-xl py-3 pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-[#facc15]/50 focus:border-amber-400 dark:focus:border-[#facc15] transition-all"
                  autoFocus
                />
              </div>

              {/* User List */}
              <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
                {isLoadingUsers ? (
                  <div className="text-center py-12">
                    <Loader className="size-8 animate-spin text-amber-500 dark:text-[#facc15] mx-auto" />
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Searching...</p>
                  </div>
                ) : availableUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="size-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {searchQuery ? "No users found" : "Search for users to add"}
                    </p>
                  </div>
                ) : (
                  availableUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-[rgba(212,175,55,0.15)] hover:border-amber-400 dark:hover:border-[#facc15]/50 transition-all group"
                    >
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="size-11 rounded-full object-cover border-2 border-gray-200 dark:border-[rgba(212,175,55,0.2)] group-hover:border-amber-400 dark:group-hover:border-[#facc15]/50"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-semibold text-sm truncate">{user.fullName}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">@{user.username}</p>
                      </div>
                      <button
                        onClick={() => handleAddMember(user._id)}
                        className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-[#facc15] dark:hover:bg-[#d4af37] text-white dark:text-black transition-all shadow-md hover:scale-110"
                        title="Add to group"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0b0b0f] border border-gray-200 dark:border-[rgba(212,175,55,0.3)] rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Group</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{group?.name}</span>?
              </p>
              <p className="text-red-600 dark:text-red-400 text-xs font-medium">
                This action cannot be undone. All messages will be permanently deleted.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)] border border-gray-300 dark:border-[rgba(212,175,55,0.2)] text-gray-700 dark:text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

GroupInfoSidebar.displayName = 'GroupInfoSidebar';

export default GroupInfoSidebar;
