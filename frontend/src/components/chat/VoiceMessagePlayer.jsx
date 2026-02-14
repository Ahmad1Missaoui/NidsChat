import { useRef, useState, useEffect, memo } from 'react';
import { PlayIcon, PauseIcon } from 'lucide-react';
import { formatDuration } from '../../utils/chatHelpers';

/**
 * VoiceMessagePlayer Component
 * Audio player with waveform-style UI
 */
const VoiceMessagePlayer = memo(({ src, isSender }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => {
      const dur = audio.duration;
      setDuration(isNaN(dur) || !isFinite(dur) ? 0 : dur);
    };
    
    const handleTime = () => {
      const time = audio.currentTime;
      setCurrentTime(isNaN(time) || !isFinite(time) ? 0 : time);
    };
    
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setIsPlaying(false);
      setDuration(0);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [src]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
    }
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const nextTime = Number(event.target.value);
    if (!isNaN(nextTime) && isFinite(nextTime)) {
      audio.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 min-w-[240px] ${
        isSender 
          ? "bg-gradient-to-r from-[#f5d9b8] to-[#edc09a]" 
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <button
        onClick={togglePlayback}
        className="size-9 rounded-full bg-[#0f0f16] text-[#facc15] flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.3)] hover:shadow-[0_0_18px_rgba(212,175,55,0.5)] transition-all flex-shrink-0"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
      </button>

      {/* Waveform-style progress */}
      <div className="flex-1 relative h-6 flex items-center">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 rounded-full appearance-none cursor-pointer voice-slider"
          style={{
            background: `linear-gradient(to right, #b8860b 0%, #b8860b ${progress}%, #ddd ${progress}%, #ddd 100%)`
          }}
        />
      </div>

      <span className="text-[11px] text-[#7a6b5b] min-w-[38px] text-right font-mono">
        {formatDuration(duration)}
      </span>

      <audio ref={audioRef} src={src} className="hidden" preload="metadata" />
    </div>
  );
});

VoiceMessagePlayer.displayName = 'VoiceMessagePlayer';

export default VoiceMessagePlayer;
