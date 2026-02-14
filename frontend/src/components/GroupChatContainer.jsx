import { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import useKeyboardSound from "../hooks/useKeyboardSound";
import ChatHeader from "./ChatHeader";
import {
  SendIcon,
  ImageIcon,
  SmileIcon,
  LoaderIcon,
  UsersIcon,
  LogOutIcon,
  FileIcon,
  VideoIcon,
  MicIcon,
  PlusIcon,
  XIcon,
  PaperclipIcon,
  DownloadIcon,
  UserPlusIcon,
  Trash2Icon,
  SearchIcon,
  MoreVerticalIcon, 
} from "lucide-react";
import { formatMessageTime } from "../lib/utils";
import { useChatStore } from "../store/useChatStore"; // Import useChatStore

const backgroundImages = [
  '/conversations/img1.jpg',
  '/conversations/img3.jpg',
  '/conversations/img4.jpg',
];

function GroupChatContainer({ group: initialGroup, onBack }) {
  const {
    groupMessages,
    getGroupMessages,
    sendGroupMessage,
    isSendingMessage,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    leaveGroup,
    addMember,
    removeMember,
    getGroupDetails,
    currentGroup,
    setCurrentGroup,
    deleteGroupMessage,
  } = useGroupStore();
  const { authUser } = useAuthStore();
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const { isSoundEnabled } = useChatStore(); // Import sound setting
  
  // Use currentGroup from store if available, otherwise use prop
  const group = currentGroup?._id === initialGroup?._id ? currentGroup : initialGroup;
  
  const [messageText, setMessageText] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null); // For message dropdown
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const recordingInterval = useRef(null);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleLeaveGroup = async () => {
    if (confirm(`Are you sure you want to leave ${group?.name}?`)) {
      const success = await leaveGroup(group._id);
      if (success) {
        onBack();
      }
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
      await removeMember(group._id, memberId);
    }
  };

  const handleAddMember = async (userId) => {
    const success = await addMember(group._id, userId);
    if (success) {
      setShowAddMemberModal(false);
      setSearchQuery("");
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setAvailableUsers([]);
      return;
    }
    
    setIsLoadingUsers(true);
    try {
      const { axiosInstance } = await import("../lib/axios");
      const res = await axiosInstance.get("/messages/contacts");
      // Filter out users already in the group
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

  // Select random background on mount and when group changes
  useEffect(() => {
    const randomBg = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    setBackgroundImage(randomBg);
  }, [group?._id]);

  // Sync group prop to store
  useEffect(() => {
    if (initialGroup && (!currentGroup || currentGroup._id !== initialGroup._id)) {
      setCurrentGroup(initialGroup);
    }
  }, [initialGroup?._id, setCurrentGroup]);

  useEffect(() => {
    if (showAddMemberModal) {
      searchUsers();
    }
  }, [searchQuery, showAddMemberModal]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
if (isSoundEnabled) playRandomKeyStrokeSound(); // Play sound on file selection too

    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
      setFileType(type);
    };
    reader.readAsDataURL(file);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
          setFileType('voice');
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Could not access microphone:", error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      setRecordingTime(0);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const removeFile = () => {
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const getFilePreview = () => {
    if (!filePreview) return null;

    if (fileType === 'image') {
      return (
        <img
          src={filePreview}
          alt="Preview"
          className="w-20 h-20 object-cover rounded-lg border border-[#2a2a34]"
        />
      );
    } else if (fileType === 'video') {
      return (
        <video
          src={filePreview}
          className="w-32 h-20 object-cover rounded-lg border border-[#2a2a34]"
          controls
        />
      );
    } else if (fileType === 'document') {
      return (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-[#2a2a34] bg-[#1a1a24]">
          <FileIcon className="w-8 h-8 text-[#facc15]" />
          <span className="text-sm text-white truncate max-w-[150px]">
            {documentInputRef.current?.files[0]?.name || 'Document'}
          </span>
        </div>
      );
    } else if (fileType === 'voice') {
      return (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-[#2a2a34] bg-[#1a1a24]">
          <MicIcon className="w-8 h-8 text-[#facc15]" />
          <span className="text-sm text-[#facc15]">Voice message</span>
        </div>
      );
    }
  };

  useEffect(() => {
    if (group?._id) {
      getGroupMessages(group._id);
      subscribeToGroupMessages();
    }
    
    return () => {
      unsubscribeFromGroupMessages();
    };
  }, [group?._id]); // Remove function dependencies to prevent re-subscription

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !filePreview) return;

    const messageData = {
      text: messageText.trim(),
      fileType: fileType || 'text',
    };

    if (fileType === 'image') messageData.image = filePreview;
    else if (fileType === 'document') {
      messageData.document = filePreview;
      messageData.documentName = documentInputRef.current?.files[0]?.name || 'document';
    }
    else if (fileType === 'video') messageData.video = filePreview;
    else if (fileType === 'voice') messageData.voice = filePreview;

    await sendGroupMessage(group._id, messageData);
    setMessageText("");
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const isAdmin = group?.admins?.some((admin) => 
    typeof admin === 'string' ? admin === authUser._id : admin._id === authUser._id
  ) || group?.admin === authUser._id || group?.admin?._id === authUser._id;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#0c0c12] to-[#14141c]">
      {/* Header */}
      <ChatHeader 
        group={group}
        onBack={onBack}
        onSettingsClick={() => setShowGroupInfo(!showGroupInfo)}
        isAdmin={isAdmin}
      />

      {/* Messages */}
      <div 
        className="flex-1 px-6 overflow-y-auto py-8 custom-scrollbar flex flex-col relative"
        style={{
          backgroundImage: `linear-gradient(rgba(7, 7, 12, 0.85), rgba(7, 7, 12, 0.85)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        {groupMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gradient-to-br from-[#facc15]/10 to-[#d4af37]/5 rounded-full p-8 mb-4">
              <UsersIcon className="w-16 h-16 text-[#facc15] opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Start the conversation</h3>
            <p className="text-gray-400 max-w-md">
              Send a message to {group?.name}
            </p>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto space-y-4 mt-auto">
            {groupMessages.map((message) => {
              const isSender = message.sender?._id === authUser._id;
              const senderName = isSender ? "You" : message.sender?.fullName || "Unknown";

              return (
                <div
                  key={message._id}
                  className={`flex ${isSender ? "justify-end" : "justify-start"} group relative`}
                  onMouseLeave={() => setActiveMessageId(null)}
                >
                  <div className={`flex gap-3 max-w-[70%] ${isSender ? "flex-row-reverse" : ""}`}>
                    {!isSender && (
                      <img
                        src={message.sender?.profilePic || "/avatar.png"}
                        alt={senderName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-[#facc15]/30"
                      />
                    )}
                    
                    <div className={`flex flex-col ${isSender ? "items-end" : "items-start"} relative`}>
                      {!isSender && (
                        <span className="text-xs text-[#facc15] font-medium mb-1">
                          {senderName}
                        </span>
                      )}
                      
                      {/* Message Deletion Dropdown */}
                      {isSender && !message.isDeleted && (
                        <div className="absolute top-0 -right-8 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMessageId(activeMessageId === message._id ? null : message._id);
                              }}
                              className="p-1 rounded-full bg-[#14141c] border border-[#2a2a34] text-gray-400 hover:text-white"
                            >
                              <MoreVerticalIcon className="w-4 h-4" />
                            </button>
                            
                            {activeMessageId === message._id && (
                              <div className="absolute right-0 top-6 w-40 bg-[#14141c] border border-[#2a2a34] rounded-lg shadow-xl overflow-hidden z-50">
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await deleteGroupMessage(group._id, message._id, false);
                                    setActiveMessageId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#1a1a24] text-left"
                                >
                                  <Trash2Icon className="w-3.5 h-3.5" />
                                  Delete for me
                                </button>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await deleteGroupMessage(group._id, message._id, true);
                                    setActiveMessageId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#1a1a24] text-left border-t border-[#2a2a34]"
                                >
                                  <Trash2Icon className="w-3.5 h-3.5" />
                                  Delete for everyone
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isSender
                            ? "bg-gradient-to-r from-[#facc15] to-[#d4af37] text-black"
                            : "bg-[#1a1a24] border border-[#2a2a34] text-white"
                        }`}
                      >
                        {message.image && (
                          <img
                            src={message.image}
                            alt="attachment"
                            className="max-w-xs rounded-lg mb-2"
                          />
                        )}
                        {message.video && (
                          <video
                            src={message.video}
                            controls
                            className="max-w-xs rounded-lg mb-2"
                          />
                        )}
                        {message.document && (
                          <a
                            href={message.document}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 rounded-lg bg-[#14141c] border border-[#2a2a34] hover:border-[#facc15] transition-colors mb-2"
                          >
                            <FileIcon className="w-6 h-6 text-[#facc15]" />
                            <span className="text-sm flex-1 truncate">{message.documentName || 'Document'}</span>
                            <DownloadIcon className="w-4 h-4" />
                          </a>
                        )}
                        {message.voice && (
                          <audio src={message.voice} controls className="max-w-xs mb-2" />
                        )}
                        {message.text && <p className="break-words">{message.text}</p>}
                      </div>
                      
                      <span className="text-xs text-gray-500 mt-1">
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-[#2a2a34] p-4 bg-[#14141c]/95 backdrop-blur-sm">
        {/* Recording UI */}
        {isRecording && (
          <div className="mb-3 bg-gradient-to-r from-[#facc15]/20 to-[#d4af37]/20 backdrop-blur-xl border border-[#facc15]/40 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 bg-red-500 rounded-full animate-ping opacity-40"></div>
                <div className="relative bg-red-500 p-3 rounded-full">
                  <MicIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1 flex items-center gap-1 h-12">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-[#facc15] to-[#d4af37] rounded-full"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
              
              <div className="text-[#facc15] font-mono text-lg font-semibold min-w-[60px] text-center">
                {formatTime(recordingTime)}
              </div>
              
              <button
                type="button"
                onClick={cancelVoiceRecording}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl transition-all"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={stopVoiceRecording}
                className="bg-gradient-to-r from-[#facc15] to-[#d4af37] text-black px-4 py-2 rounded-xl font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* File Preview */}
        {filePreview && (
          <div className="mb-3 flex items-center">
            <div className="relative">
              {getFilePreview()}
              <button
                onClick={removeFile}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#14141c] border border-[#2a2a34] flex items-center justify-center text-[#facc15] hover:bg-[#1a1a24]"
                type="button"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {/* Hidden file inputs */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e, 'image')}
            className="hidden"
          />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
            ref={documentInputRef}
            onChange={(e) => handleFileChange(e, 'document')}
            className="hidden"
          />
          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            onChange={(e) => handleFileChange(e, 'video')}
            className="hidden"
          />

          {/* Attachment menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 bg-[#1a1a24] border border-[#2a2a34] text-[#facc15] hover:bg-[#facc15]/10 rounded-lg transition-all"
            >
              <PlusIcon className={`w-5 h-5 transition-transform ${showAttachMenu ? 'rotate-45' : ''}`} />
            </button>

            {showAttachMenu && (
              <div className="absolute bottom-full mb-2 left-0 w-48 bg-[#14141c] border border-[#2a2a34] rounded-xl overflow-hidden shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowAttachMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#facc15] hover:bg-[#1a1a24] transition-all border-b border-[#2a2a34]"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm">Send Image</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    documentInputRef.current?.click();
                    setShowAttachMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#facc15] hover:bg-[#1a1a24] transition-all border-b border-[#2a2a34]"
                >
                  <PaperclipIcon className="w-5 h-5" />
                  <span className="text-sm">Send Document</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    videoInputRef.current?.click();
                    setShowAttachMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#facc15] hover:bg-[#1a1a24] transition-all border-b border-[#2a2a34]"
                >
                  <VideoIcon className="w-5 h-5" />
                  <span className="text-sm">Send Video</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    startVoiceRecording();
                    setShowAttachMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#facc15] hover:bg-[#1a1a24] transition-all"
                >
                  <MicIcon className="w-5 h-5" />
                  <span className="text-sm">Record Voice</span>
                </button>
              </div>
            )}
          </div>

          <input{
              setMessageText(e.target.value);
              if (isSoundEnabled) playRandomKeyStrokeSound();
            }
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={`Message ${group?.name}...`}
            className="flex-1 bg-[#1a1a24] border border-[#2a2a34] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 focus:border-[#facc15] transition-all"
          />

          <button
            type="submit"
            disabled={(!messageText.trim() && !filePreview) || isSendingMessage}
            className="p-3 bg-gradient-to-r from-[#facc15] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b8860b] rounded-xl text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[#facc15]/30"
          >
            {isSendingMessage ? (
              <LoaderIcon className="w-5 h-5 animate-spin" />
            ) : (
              <SendIcon className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      {/* Group Info Sidebar (Optional) */}
      {showGroupInfo && (
        <div className="absolute right-0 top-0 h-full w-80 bg-[#14141c] border-l border-[#2a2a34] p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Group Info</h3>
            <button
              onClick={() => setShowGroupInfo(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="text-center mb-6">
            <img
              src={group?.avatar || "/avatar.png"}
              alt={group?.name}
              className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-[#facc15]/50"
            />
            <h4 className="text-xl font-bold text-white">{group?.name}</h4>
            {group?.description && (
              <p className="text-gray-400 text-sm mt-2">{group.description}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-gray-400">
                MEMBERS ({group?.members?.length})
              </h5>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="p-1.5 rounded-lg bg-gradient-to-r from-[#facc15] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b8860b] text-black transition-all"
                  title="Add Member"
                >
                  <UserPlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {group?.members?.map((member) => {
                const isMemberAdmin = group?.admins?.some((admin) => 
                  typeof admin === 'string' ? admin === member._id : admin._id === member._id
                ) || (typeof group?.admin === 'string' ? group?.admin === member._id : group?.admin?._id === member._id);
                
                return (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group/member"
                  >
                    <img
                      src={member.profilePic || "/avatar.png"}
                      alt={member.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{member.fullName}</p>
                      <p className="text-gray-400 text-xs">@{member.username}</p>
                    </div>
                    {isMemberAdmin && (
                      <span className="text-xs bg-gradient-to-r from-[#facc15] to-[#d4af37] text-black px-2 py-1 rounded-full font-bold">
                        Admin
                      </span>
                    )}
                    {isAdmin && !isMemberAdmin && member._id !== authUser._id && (
                      <button
                        onClick={() => handleRemoveMember(member._id, member.fullName)}
                        className="opacity-0 group-hover/member:opacity-100 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all"
                        title="Remove Member"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#2a2a34]">
            <button
              onClick={handleLeaveGroup}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-bold shadow-xl hover:shadow-red-500/30"
            >
              <LogOutIcon className="w-5 h-5" />
              Leave Group
            </button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#14141c] border border-[#2a2a34] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a34]">
              <h3 className="text-xl font-bold text-white">Add Member</h3>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSearchQuery("");
                  setAvailableUsers([]);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Search Input */}
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a24] border border-[#2a2a34] rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 focus:border-[#facc15] transition-all"
                />
              </div>

              {/* Users List */}
              <div className="max-h-80 overflow-y-auto space-y-2">
                {isLoadingUsers ? (
                  <div className="text-center py-8">
                    <LoaderIcon className="w-8 h-8 animate-spin text-[#facc15] mx-auto" />
                  </div>
                ) : availableUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <UsersIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">
                      {searchQuery ? "No users found" : "Search for users to add"}
                    </p>
                  </div>
                ) : (
                  availableUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a24] border border-[#2a2a34] hover:border-[#facc15]/50 transition-all"
                    >
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{user.fullName}</p>
                        <p className="text-gray-400 text-xs">@{user.username}</p>
                      </div>
                      <button
                        onClick={() => handleAddMember(user._id)}
                        className="p-2 rounded-lg bg-gradient-to-r from-[#facc15] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b8860b] text-black transition-all"
                        title="Add to group"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupChatContainer;
