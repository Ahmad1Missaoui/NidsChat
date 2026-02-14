import { useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import NotificationBell from "./NotificationBell";
import toast from "react-hot-toast";

function ProfileHeader() {
  const { authUser, updateProfile } = useAuthStore();

  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      console.log("Base64 image created, length:", base64Image.length);
      
      try {
        await updateProfile({ profilePic: base64Image });
      } catch (error) {
        console.error("Upload failed:", error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      toast.error("Failed to read image file");
    };
  };

  return (
    <div className="p-6 border-b border-gray-200 dark:border-[rgba(212,175,55,0.14)] bg-white dark:bg-[rgba(12,12,18,0.8)] dark:backdrop-blur-xl transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            <button
              className="size-14 rounded-full overflow-hidden relative group ring-2 ring-gray-200 dark:ring-[rgba(212,175,55,0.4)] ring-offset-2 ring-offset-white dark:ring-offset-[#0b0b0f] shadow-sm dark:shadow-[0_0_22px_rgba(212,175,55,0.25)]"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-base max-w-[180px] truncate tracking-wide">
              {authUser.fullName}
            </h3>

            <p className="text-gray-500 dark:text-[#facc15] text-xs truncate max-w-[180px]">@{authUser.username}</p>
          </div>
        </div>

        {/* Notification Bell */}
        <NotificationBell />
      </div>
    </div>
  );
}
export default ProfileHeader;