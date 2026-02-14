import { useState, useEffect, useRef } from "react";
import { XIcon, UsersIcon, LoaderIcon, SearchIcon, CheckIcon, ImageIcon, UploadIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGroupStore } from "../store/useGroupStore";
import { useFriendStore } from "../store/useFriendStore";
import toast from "react-hot-toast";

function CreateGroupModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [groupName, setGroupName] = useState("");
  const [groupAvatarFile, setGroupAvatarFile] = useState(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  
  const { createGroup, isCreating } = useGroupStore();
  const { friends, getFriends } = useFriendStore();

  useEffect(() => {
    if (isOpen && friends.length === 0) {
      getFriends();
    }
  }, [isOpen, getFriends, friends.length]);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (friendId) => {
    setSelectedMembers((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('create_group.error_image_size'));
        return;
      }
      setGroupAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error(t('create_group.error_name'));
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error(t('create_group.error_members'));
      return;
    }

    const groupData = {
      name: groupName,
      description: description || undefined,
      members: selectedMembers,
    };

    // Add avatar if file is selected
    if (groupAvatarFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        groupData.avatar = reader.result;
        const result = await createGroup(groupData);
        if (result) {
          resetForm();
          onClose();
        }
      };
      reader.readAsDataURL(groupAvatarFile);
    } else {
      const result = await createGroup(groupData);
      if (result) {
        resetForm();
        onClose();
      }
    }
  };

  const resetForm = () => {
    setGroupName("");
    setGroupAvatarFile(null);
    setGroupAvatarPreview("");
    setDescription("");
    setSelectedMembers([]);
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#0b0b0f] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-[rgba(212,175,55,0.3)]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-[rgba(212,175,55,0.2)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-[rgba(212,175,55,0.15)] rounded-xl p-2.5">
              <UsersIcon className="w-6 h-6 text-amber-600 dark:text-[#facc15]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('create_group.title')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('create_group.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
          
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('create_group.group_name_label')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t('create_group.group_name_placeholder')}
              className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-300 dark:border-[rgba(212,175,55,0.25)] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-[#facc15] focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Group Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('create_group.group_avatar_label')}
            </label>
            <div className="flex items-center gap-4">
              {groupAvatarPreview ? (
                <div className="relative">
                  <img
                    src={groupAvatarPreview}
                    alt="Group avatar preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-[rgba(212,175,55,0.3)]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGroupAvatarFile(null);
                      setGroupAvatarPreview("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#18181b] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-[rgba(212,175,55,0.3)]">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#18181b] hover:bg-gray-200 dark:hover:bg-[#27272a] text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm transition-all border border-gray-300 dark:border-[rgba(212,175,55,0.25)]"
                >
                  <UploadIcon className="w-4 h-4" />
                  {t('create_group.choose_photo')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('create_group.max_size')}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('create_group.description_label')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('create_group.description_placeholder')}
              rows={3}
              className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-300 dark:border-[rgba(212,175,55,0.25)] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-[#facc15] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Add Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('create_group.add_members_label')} <span className="text-red-500">*</span>
            </label>
            
            {/* Search Friends */}
            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('create_group.search_friends_placeholder')}
                className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-300 dark:border-[rgba(212,175,55,0.25)] rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-[#facc15] focus:border-transparent transition-all"
              />
            </div>

            {/* Selected Count */}
            {selectedMembers.length > 0 && (
              <div className="mb-3 px-4 py-2 bg-amber-50 dark:bg-[rgba(212,175,55,0.1)] border border-amber-200 dark:border-[rgba(212,175,55,0.3)] rounded-lg">
                <span className="text-sm font-medium text-amber-700 dark:text-[#facc15]">
                  ✓ {selectedMembers.length} {t('create_group.members_selected')}
                </span>
              </div>
            )}

            {/* Friends List */}
            <div className="bg-gray-50 dark:bg-[#18181b] border border-gray-300 dark:border-[rgba(212,175,55,0.25)] rounded-xl max-h-60 overflow-y-auto">
              {filteredFriends.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  {friends.length === 0 ? t('create_group.no_friends') : t('create_group.no_friends_found')}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-[rgba(255,255,255,0.05)]">
                  {filteredFriends.map((friend) => (
                    <label
                      key={friend._id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.03)] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(friend._id)}
                        onChange={() => toggleMember(friend._id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-[#27272a] text-amber-600 dark:text-[#facc15] focus:ring-amber-500 dark:focus:ring-[#facc15] focus:ring-offset-0"
                      />
                      <img
                        src={friend.profilePic || "/avatar.png"}
                        alt={friend.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-[rgba(255,255,255,0.1)]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-medium truncate">{friend.fullName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{friend.username}</p>
                      </div>
                      {selectedMembers.includes(friend._id) && (
                        <CheckIcon className="w-5 h-5 text-amber-600 dark:text-[#facc15]" />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-[rgba(212,175,55,0.2)] p-6 flex gap-3 bg-gray-50 dark:bg-[#0b0b0f]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-2.5 bg-white dark:bg-[#18181b] hover:bg-gray-50 dark:hover:bg-[#27272a] text-gray-700 dark:text-white rounded-xl font-medium transition-all border border-gray-300 dark:border-[rgba(212,175,55,0.25)]"
          >
            {t('create_group.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating || !groupName.trim() || selectedMembers.length === 0}
            className="flex-1 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 dark:bg-[#facc15] dark:hover:bg-[#d4af37] text-white dark:text-black rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <LoaderIcon className="w-5 h-5 animate-spin" />
                {t('create_group.creating')}
              </>
            ) : (
              t('create_group.create')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
