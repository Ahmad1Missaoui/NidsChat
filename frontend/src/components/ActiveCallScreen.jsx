import { useEffect, useRef } from "react";
import { PhoneOffIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

function ActiveCallScreen() {
  const {
    isCallActive,
    isCalling,
    callType,
    caller,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isSpeakerOn,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    endCall,
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isCallActive && !isCalling) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#050507] to-[#0b0b0f]">
      {/* Remote Video/Audio */}
      <div className="absolute inset-0">
        {callType === 'video' ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-8">
              <div className="absolute inset-0 bg-[#facc15] rounded-full animate-pulse opacity-20"></div>
              <div className="relative w-48 h-48 rounded-full ring-8 ring-[rgba(212,175,55,0.3)] ring-offset-8 ring-offset-[#0b0b0f] overflow-hidden shadow-[0_20px_60px_rgba(212,175,55,0.4)]">
                <img
                  src={caller?.profilePic || "/avatar.png"}
                  alt={caller?.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{caller?.fullName}</h2>
            <p className="text-[#facc15] uppercase tracking-wider">
              {isCalling ? 'Calling...' : 'Connected'}
            </p>
          </div>
        )}
        <audio ref={remoteVideoRef} autoPlay />
      </div>

      {/* Local Video (Picture-in-Picture) */}
      {callType === 'video' && localStream && (
        <div className="absolute top-6 right-6 w-48 h-36 rounded-2xl overflow-hidden border-4 border-[rgba(212,175,55,0.5)] shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        </div>
      )}

      {/* Call Info */}
      <div className="absolute top-8 left-8 text-white">
        <h3 className="text-xl font-semibold mb-1">{caller?.fullName}</h3>
        <p className="text-[#facc15] text-sm uppercase tracking-wide">
          {isCalling ? 'Connecting...' : 'In Call'}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
        {/* Mute/Unmute */}
        <button
          onClick={toggleMute}
          className={`p-5 rounded-full transition-all shadow-lg ${
            isMuted
              ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50'
              : 'bg-[rgba(12,12,18,0.9)] hover:bg-[rgba(20,20,28,0.9)] border-2 border-[rgba(212,175,55,0.4)]'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <MicOffIcon className="w-6 h-6 text-white" />
          ) : (
            <MicIcon className="w-6 h-6 text-[#facc15]" />
          )}
        </button>

        {/* Speaker Toggle */}
        <button
          onClick={toggleSpeaker}
          className={`p-5 rounded-full transition-all shadow-lg ${
            !isSpeakerOn
              ? 'bg-[rgba(12,12,18,0.9)] hover:bg-[rgba(20,20,28,0.9)] border-2 border-[rgba(212,175,55,0.4)]'
              : 'bg-gradient-to-br from-[#facc15] to-[#d4af37] shadow-[0_8px_24px_rgba(212,175,55,0.4)]'
          }`}
          title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
        >
          {isSpeakerOn ? (
            <Volume2Icon className="w-6 h-6 text-[#0b0b0f]" />
          ) : (
            <VolumeXIcon className="w-6 h-6 text-[#facc15]" />
          )}
        </button>

        {/* End Call */}
        <button
          onClick={endCall}
          className="p-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 shadow-[0_10px_40px_rgba(239,68,68,0.5)] hover:shadow-[0_15px_50px_rgba(239,68,68,0.7)] transition-all"
          title="End Call"
        >
          <PhoneOffIcon className="w-8 h-8 text-white" />
        </button>

        {/* Video Toggle */}
        {callType === 'video' && (
          <button
            onClick={toggleVideo}
            className={`p-5 rounded-full transition-all shadow-lg ${
              isVideoOff
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50'
                : 'bg-[rgba(12,12,18,0.9)] hover:bg-[rgba(20,20,28,0.9)] border-2 border-[rgba(212,175,55,0.4)]'
            }`}
            title={isVideoOff ? 'Turn On Video' : 'Turn Off Video'}
          >
            {isVideoOff ? (
              <VideoOffIcon className="w-6 h-6 text-white" />
            ) : (
              <VideoIcon className="w-6 h-6 text-[#facc15]" />
            )}
          </button>
        )}
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}

export default ActiveCallScreen;
