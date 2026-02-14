import { PhoneIcon, VideoIcon, XIcon } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

function IncomingCallModal() {
  const { isReceivingCall, caller, callType, answerCall, rejectCall, incomingSignal } = useCallStore();

  if (!isReceivingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-[rgba(12,12,18,0.95)] to-[rgba(20,20,28,0.95)] border-2 border-[rgba(212,175,55,0.4)] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {/* Caller Info */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-24 h-24 mb-4">
            <div className="absolute inset-0 bg-[#facc15] rounded-full animate-ping opacity-30"></div>
            <div className="relative w-24 h-24 rounded-full ring-4 ring-[rgba(212,175,55,0.5)] ring-offset-4 ring-offset-[#0b0b0f] overflow-hidden">
              <img
                src={caller?.profilePic || "/avatar.png"}
                alt={caller?.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">{caller?.fullName}</h3>
          <p className="text-[#facc15] uppercase tracking-wider text-sm flex items-center justify-center gap-2">
            {callType === 'video' ? (
              <>
                <VideoIcon className="w-4 h-4" />
                Video Call
              </>
            ) : (
              <>
                <PhoneIcon className="w-4 h-4" />
                Voice Call
              </>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {/* Reject */}
          <button
            onClick={rejectCall}
            className="group relative p-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 shadow-[0_8px_24px_rgba(239,68,68,0.4)] hover:shadow-[0_12px_32px_rgba(239,68,68,0.6)] transition-all duration-200"
          >
            <XIcon className="w-8 h-8 text-white" />
          </button>

          {/* Answer */}
          <button
            onClick={() => answerCall(incomingSignal)}
            className="group relative p-6 rounded-full bg-gradient-to-br from-[#facc15] via-[#d4af37] to-[#b8860b] hover:shadow-[0_12px_32px_rgba(212,175,55,0.6)] transition-all duration-200 animate-pulse"
          >
            {callType === 'video' ? (
              <VideoIcon className="w-8 h-8 text-[#0b0b0f]" />
            ) : (
              <PhoneIcon className="w-8 h-8 text-[#0b0b0f]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallModal;
