
import React, { useEffect, useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import { useFriendStore } from "../store/useFriendStore";
import SmartReplySuggestions from "./chat/SmartReplySuggestions";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon, FileIcon, VideoIcon, MicIcon, PaperclipIcon, PlusIcon } from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef(null);

  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const { sendMessage, selectedGroup, selectedUser, isSoundEnabled, messages } = useChatStore();
  const { sendGroupMessage, isSendingMessage } = useGroupStore();
  const { blockedUsers, getBlockedUsers, checkFriendship, friendshipStatusByUser } = useFriendStore();
  const socket = useAuthStore.getState().socket;

  const isGroupChat = !!selectedGroup;
  const currentChat = isGroupChat ? selectedGroup : selectedUser;

  const isBlocked = !isGroupChat && selectedUser
    ? blockedUsers.some((user) => user._id === selectedUser._id)
    : false;
  const isBlockedByOther = !isGroupChat && selectedUser
    ? !!friendshipStatusByUser[selectedUser._id]?.isBlockedByOther
    : false;
  const isConversationBlocked = isBlocked || isBlockedByOther;

  const handleTyping = () => {
    if (isGroupChat) {
         if (socket) socket.emit("typing", { to: selectedGroup._id, isGroup: true });
    } else {
         if (socket) socket.emit("typing", { to: selectedUser._id, isGroup: false });
    }
    
    // Clear timeout if exists
    if (window.typingTimeout) clearTimeout(window.typingTimeout);

    window.typingTimeout = setTimeout(() => {
        if (isGroupChat) {
            if (socket) socket.emit("stopTyping", { to: selectedGroup._id, isGroup: true });
        } else {
            if (socket) socket.emit("stopTyping", { to: selectedUser._id, isGroup: false });
        }
    }, 2000);
  };
  
  // ... useEffect logic ...

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !filePreview) return;
    
    const messageData = {
      text: text.trim(),
    };
    
    if (filePreview) {
       if (fileType === 'image') messageData.image = filePreview;
       else if (fileType === 'video') messageData.video = filePreview;
       else if (fileType === 'document') messageData.document = filePreview;
    }

    if (window.typingTimeout) clearTimeout(window.typingTimeout);
    
    if (socket) {
        if (isGroupChat) {
             socket.emit("stopTyping", { to: selectedGroup._id, isGroup: true });
        } else {
             socket.emit("stopTyping", { to: selectedUser._id, isGroup: false });
        }
    }

    try {
      if (isGroupChat) {
        await sendGroupMessage(selectedGroup._id, messageData);
      } else {
        await sendMessage(messageData);
      }
      
      // Reset state
      setText("");
      setFilePreview(null);
      setFileType(null);
      setShowAttachMenu(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (documentInputRef.current) documentInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };


  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (type === 'image' && !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (type === 'video' && !file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

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
      
      // Start timer
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Could not access microphone");
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
      // Don't save the recording
      toast.success("Recording cancelled");
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
          className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-[rgba(212,175,55,0.25)] shadow-sm dark:shadow-[0_0_18px_rgba(212,175,55,0.22)]"
        />
      );
    } else if (fileType === 'video') {
      return (
        <video
          src={filePreview}
          className="w-32 h-20 object-cover rounded-lg border border-gray-200 dark:border-[rgba(212,175,55,0.25)] shadow-sm dark:shadow-[0_0_18px_rgba(212,175,55,0.22)]"
          controls
        />
      );
    } else if (fileType === 'document') {
      return (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-[rgba(212,175,55,0.25)] bg-white dark:bg-[rgba(12,12,18,0.8)]">
          <FileIcon className="w-8 h-8 text-gray-500 dark:text-[#facc15]" />
          <span className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">
            {documentInputRef.current?.files[0]?.name || 'Document'}
          </span>
        </div>
      );
    } else if (fileType === 'voice') {
      return (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-[rgba(212,175,55,0.25)] bg-white dark:bg-[rgba(12,12,18,0.8)]">
          <MicIcon className="w-8 h-8 text-gray-500 dark:text-[#facc15]" />
          <span className="text-sm text-gray-900 dark:text-[#facc15]">Voice message</span>
        </div>
      );
    }
  };

  if (!isGroupChat && isConversationBlocked) {
    return (
      <div className="p-4 border-t border-gray-100 dark:border-[rgba(212,175,55,0.16)] bg-white/80 dark:bg-[rgba(10,10,15,0.78)] backdrop-blur-xl">
        <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
          {isBlockedByOther
            ? "Messaging is disabled because this user blocked you."
            : "Messaging is disabled because you blocked this user."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-4 bg-transparent">
      {/* Smart Reply Suggestions - AI powered */}
      {!isGroupChat && messages && messages.length > 0 && (
        <SmartReplySuggestions
          lastMessage={messages[messages.length - 1]}
          onSelectSuggestion={(suggestion) => setText(suggestion)}
        />
      )}

      {/* Recording UI Overlay */}
      {isRecording && (
        <div className="max-w-2xl mx-auto mb-4 bg-white dark:bg-[#18181b] backdrop-blur-xl border border-gray-200 dark:border-[rgba(255,255,255,0.1)] rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-4">
            {/* Pulsing mic icon */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 bg-red-500 rounded-full animate-ping opacity-40"></div>
              <div className="relative bg-red-500 p-3 rounded-full shadow-lg">
                <MicIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Waveform animation */}
            <div className="flex-1 flex items-center gap-1 h-12">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-gray-400 to-gray-600 dark:from-[#facc15] dark:to-[#d4af37] rounded-full"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
            
            {/* Timer */}
            <div className="text-gray-900 dark:text-[#facc15] font-mono text-lg font-semibold min-w-[60px] text-center">
              {formatTime(recordingTime)}
            </div>
            
            {/* Cancel button */}
            <button
              type="button"
              onClick={cancelVoiceRecording}
              className="bg-red-50 hover:bg-red-100 dark:bg-[rgba(239,68,68,0.2)] dark:hover:bg-[rgba(239,68,68,0.3)] border border-red-200 dark:border-red-500/50 text-red-500 dark:text-red-400 px-4 py-2 rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
            
            {/* Stop/Save button */}
            <button
              type="button"
              onClick={stopVoiceRecording}
              className="bg-gray-900 hover:bg-black text-white dark:bg-[#facc15] dark:text-black px-4 py-2 rounded-xl font-semibold tracking-wide shadow-lg transition-all"
            >
              Save
            </button>
          </div>
          <p className="text-center text-gray-500 dark:text-[#9ca3af] text-sm mt-3">Recording voice message...</p>
        </div>
      )}
      
      {filePreview && (
        <div className="max-w-[85%] mx-auto mb-4 flex items-center justify-center animate-in slide-in-from-bottom-2">
          <div className="relative group">
            {getFilePreview()}
            <button
              onClick={removeFile}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer z-10"
              type="button"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Input Bar */}
      {!isRecording && (
      <form 
        onSubmit={handleSendMessage} 
        className="max-w-[95%] lg:max-w-4xl mx-auto flex items-center gap-2 bg-white dark:bg-[rgba(20,20,25,0.95)] border border-gray-200 dark:border-[rgba(255,255,255,0.08)] rounded-full px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
      >
        
        {/* Attachment Button (Left) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-3 rounded-full transition-all duration-200 ${showAttachMenu ? 'bg-gray-100 dark:bg-white/10 rotate-45 text-black dark:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'}`}
            title="Attach"
          >
            <PlusIcon className="w-6 h-6" />
          </button>

          {/* Attachment Dropdown (Aligned Left, Above) */}
          {showAttachMenu && (
            <div className="absolute bottom-full mb-4 left-0 w-56 bg-white dark:bg-[#1a1a20] border border-gray-200 dark:border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in zoom-in-95 origin-bottom-left">
              <div className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400"><ImageIcon className="w-5 h-5" /></div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => { documentInputRef.current?.click(); setShowAttachMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600 dark:text-purple-400"><FileIcon className="w-5 h-5" /></div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => { videoInputRef.current?.click(); setShowAttachMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <div className="p-2 bg-pink-100 dark:bg-pink-500/20 rounded-lg text-pink-600 dark:text-pink-400"><VideoIcon className="w-5 h-5" /></div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">Video</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Text Input (Middle) */}
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-[16px] py-2 px-2"
          placeholder="Type a message"
        />

        {/* Right Actions (Mic or Send) */}
        {!text.trim() && !filePreview ? (
             <button
                type="button"
                onClick={startVoiceRecording}
                className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 rounded-full transition-all"
                title="Record Voice"
             >
                <MicIcon className="w-6 h-6" />
             </button>
        ) : (
            <button
                type="submit"
                className="p-3 bg-gray-900 text-white dark:bg-[#facc15] dark:text-black rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 transform"
            >
                <SendIcon className="w-5 h-5 ml-0.5" />
            </button>
        )}

        {/* Hidden Inputs */}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
        <input type="file" accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx" ref={documentInputRef} onChange={(e) => handleFileChange(e, 'document')} className="hidden" />
        <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} className="hidden" />

      </form>
      )}
    </div>
  );
}
export default MessageInput;