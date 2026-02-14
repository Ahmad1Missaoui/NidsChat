import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { 
  ArrowLeft, User, Camera, Mail, Lock, Shield, Bell, 
  Moon, Sun, Eye, EyeOff, LogOut, Save, X, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { authUser, updateProfile, changePassword, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile Edit States
  const [profileData, setProfileData] = useState({
    fullName: authUser?.fullName || '',
    username: authUser?.username || '',
    email: authUser?.email || '',
    bio: authUser?.bio || ''
  });
  
  // Password Change States
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Notification Settings
  const [notifications, setNotifications] = useState({
    messages: true,
    calls: true,
    groups: true,
    soundEnabled: true
  });
  
  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profilePhotoVisibility: 'everyone',
    lastSeenVisibility: 'everyone',
    readReceipts: true,
    onlineStatus: true
  });

  const fileInputRef = useRef(null);

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      toast.success(t('settings.profile_updated'));
    } catch (error) {
      toast.error(t('settings.profile_update_failed'));
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('settings.password_mismatch'));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error(t('settings.password_length'));
      return;
    }
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      try {
        await updateProfile({ profilePic: base64Image });
        toast.success('Profile picture updated!');
      } catch (error) {
        toast.error('Failed to update profile picture');
      }
    };
  };

  const handleLogout = () => {
    if (window.confirm(t('settings.logout_confirm'))) {
      logout();
      navigate('/login');
    }
  };

  const sections = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'account', label: t('settings.password'), icon: Mail },
    { id: 'privacy', label: t('settings.privacy'), icon: Shield },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'appearance', label: t('settings.appearance'), icon: theme === 'dark' ? Moon : Sun },
  ];

  return (
    <div className="h-screen w-screen flex bg-[#121212] overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0b0b0f] rounded-none md:rounded-l-[40px] overflow-hidden shadow-2xl relative z-10 my-0 mr-0 border-0 md:border-l md:border-white/5 h-full pt-16 md:pt-0">
        <div className="w-full h-full flex flex-col">
          <div className="h-auto md:h-20 border-b border-gray-100 dark:border-[rgba(255,255,255,0.05)] bg-white dark:bg-[#0b0b0f] px-4 md:px-8 py-4 md:py-0 flex items-center gap-4 flex-shrink-0">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences</p>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-[rgba(212,175,55,0.15)] bg-white dark:bg-[#0b0b0f] overflow-x-auto md:overflow-y-auto">
            <div className="p-2 md:p-4 space-y-0 md:space-y-1 flex md:flex-col overflow-x-auto md:overflow-x-visible">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all whitespace-nowrap md:w-full ${
                      activeSection === section.id
                        ? 'bg-amber-100 dark:bg-[rgba(212,175,55,0.15)] text-amber-900 dark:text-[#facc15]'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    <Icon className="size-4 md:size-5" />
                    <span className="font-medium text-sm md:text-base">{section.label}</span>
                  </button>
                );
              })}
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all whitespace-nowrap md:w-full md:mt-4"
              >
                <LogOut className="size-4 md:size-5" />
                <span className="font-medium text-sm md:text-base">{t('settings.logout')}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-3 md:p-6">
            <div className="max-w-2xl mx-auto">
              
              {/* PROFILE SECTION */}
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#0b0b0f] rounded-2xl p-6 border border-gray-200 dark:border-[rgba(212,175,55,0.15)]">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings.profile_info')}</h2>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium"
                        >
                          {t('settings.edit_profile')}
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors font-medium"
                          >
                            <X className="size-5" />
                          </button>
                          <button
                            onClick={handleProfileUpdate}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                          >
                            <Save className="size-5" />
                            {t('settings.save_changes')}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Profile Picture */}
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative">
                        <div className="size-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-[rgba(212,175,55,0.3)]">
                          <img 
                            src={authUser?.profilePic || '/avatar.png'} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 p-2 bg-amber-500 hover:bg-amber-600 rounded-full text-white transition-colors"
                        >
                          <Camera className="size-4" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{authUser?.fullName}</h3>
                        <p className="text-gray-500 dark:text-gray-400">@{authUser?.username}</p>
                      </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.full_name')}</label>
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[rgba(212,175,55,0.25)] bg-white dark:bg-[#18181b] text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.username')}</label>
                        <input
                          type="text"
                          value={profileData.username}
                          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[rgba(212,175,55,0.25)] bg-white dark:bg-[#18181b] text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.email')}</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[rgba(212,175,55,0.25)] bg-white dark:bg-[#18181b] text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.bio')}</label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          disabled={!isEditing}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[rgba(212,175,55,0.25)] bg-white dark:bg-[#18181b] text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-500 resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACCOUNT SECTION */}
              {activeSection === 'account' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#0b0b0f] rounded-2xl p-6 border border-gray-200 dark:border-[rgba(212,175,55,0.15)]">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('settings.change_password')}</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.current_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-[rgba(212,175,55,0.25)] bg-white dark:bg-[#18181b] text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          >
                            {showPasswords.current ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.new_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-[rgba(212,175,55,0.25)] bg-white dark:bg-[#18181b] text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          >
                            {showPasswords.new ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.confirm_password')}</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-[rgba(212,175,55,0.25)] bg-white dark:bg-[#18181b] text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          >
                            {showPasswords.confirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handlePasswordChange}
                        className="w-full mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                      >
                        {t('settings.update_password')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PRIVACY SECTION */}
              {activeSection === 'privacy' && (
                <div className="bg-white dark:bg-[#0b0b0f] rounded-2xl p-6 border border-gray-200 dark:border-[rgba(212,175,55,0.15)]">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('settings.privacy_settings')}</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.profile_photo_visibility')}</label>
                      <select
                        value={privacy.profilePhotoVisibility}
                        onChange={(e) => setPrivacy({ ...privacy, profilePhotoVisibility: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[rgba(212,175,55,0.25)] bg-white dark:bg-[#18181b] text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="everyone">{t('settings.everyone')}</option>
                        <option value="contacts">{t('settings.friends')}</option>
                        <option value="nobody">{t('settings.nobody')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.last_seen_visibility')}</label>
                      <select
                        value={privacy.lastSeenVisibility}
                        onChange={(e) => setPrivacy({ ...privacy, lastSeenVisibility: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[rgba(212,175,55,0.25)] bg-white dark:bg-[#18181b] text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="everyone">{t('settings.everyone')}</option>
                        <option value="contacts">{t('settings.friends')}</option>
                        <option value="nobody">{t('settings.nobody')}</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('settings.read_receipts')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Let others know when you've read their messages</p>
                      </div>
                      <button
                        onClick={() => setPrivacy({ ...privacy, readReceipts: !privacy.readReceipts })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacy.readReceipts ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacy.readReceipts ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('settings.online_status')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Let others see when you're online</p>
                      </div>
                      <button
                        onClick={() => setPrivacy({ ...privacy, onlineStatus: !privacy.onlineStatus })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacy.onlineStatus ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacy.onlineStatus ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS SECTION */}
              {activeSection === 'notifications' && (
                <div className="bg-white dark:bg-[#0b0b0f] rounded-2xl p-6 border border-gray-200 dark:border-[rgba(212,175,55,0.15)]">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('settings.notification_settings')}</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('settings.message_notifications')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you receive messages</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, messages: !notifications.messages })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.messages ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.messages ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('settings.call_notifications')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about incoming calls</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, calls: !notifications.calls })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.calls ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.calls ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('settings.group_notifications')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about group activity</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, groups: !notifications.groups })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.groups ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.groups ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('settings.sound_enabled')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds for notifications</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, soundEnabled: !notifications.soundEnabled })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.soundEnabled ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* APPEARANCE SECTION */}
              {activeSection === 'appearance' && (
                <div className="bg-white dark:bg-[#0b0b0f] rounded-2xl p-6 border border-gray-200 dark:border-[rgba(212,175,55,0.15)]">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('settings.theme_settings')}</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('settings.dark_mode')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          theme === 'dark' ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="py-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white mb-3">Preview</p>
                      <div className="flex gap-4">
                        <div className="flex-1 p-4 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0b0b0f] dark:to-[#1a1a2e] border border-gray-300 dark:border-[rgba(212,175,55,0.2)]">
                          <div className="size-12 rounded-full bg-amber-500 mb-2"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
