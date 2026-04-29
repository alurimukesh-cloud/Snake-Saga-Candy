import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'Neon Grid Protocol',
    artist: 'AI System 01',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: 'Cyber Synapse',
    artist: 'AI System 02',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    title: 'AI Overdrive',
    artist: 'AI System 03',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

const formatTime = (time: number) => {
  if (isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function MusicPlayer() {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentTrack = TRACKS[currentTrackIdx];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error("Audio playback error:", err);
        setIsPlaying(false);
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIdx]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const prevTrack = () => {
    setCurrentTrackIdx((prev) => (prev === 0 ? TRACKS.length - 1 : prev - 1));
    setProgress(0);
  };

  const nextTrack = () => {
    setCurrentTrackIdx((prev) => (prev === TRACKS.length - 1 ? 0 : prev + 1));
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const handleTrackEnded = () => {
    nextTrack();
  };

  return (
    <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative neon pulse background */}
      <div 
        className={`absolute -top-20 -right-20 w-40 h-40 bg-pink-500 rounded-full blur-[100px] transition-opacity duration-1000 ${isPlaying ? 'opacity-30' : 'opacity-10'}`} 
      />
      <div 
        className={`absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500 rounded-full blur-[100px] transition-opacity duration-1000 ${isPlaying ? 'opacity-30' : 'opacity-10'}`} 
      />
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isPlaying ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-[spin_4s_linear_infinite]' : 'border-zinc-700'}`}>
            <Music className={`w-6 h-6 ${isPlaying ? 'text-pink-400' : 'text-zinc-500'}`} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white font-mono font-bold tracking-wide text-lg leading-tight truncate w-64 drop-shadow-md">
              {currentTrack.title}
            </h3>
            <p className="text-zinc-400 font-sans text-sm">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 group">
          <div className="flex justify-between font-mono text-xs text-zinc-500 mb-2 tracking-wider">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative w-full h-1.5 bg-zinc-800 rounded-full cursor-pointer">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.6)]"
              style={{ width: `${(progress / (duration || 1)) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={handleProgressChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-zinc-400 hover:text-white transition-colors p-2"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={isMuted ? 0 : volume} 
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (Number(e.target.value) > 0) setIsMuted(false);
              }}
              className="w-16 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={prevTrack}
              className="text-white hover:text-cyan-400 transition-colors p-2 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>
            <button 
              onClick={nextTrack}
              className="text-white hover:text-cyan-400 transition-colors p-2 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>
          <div className="w-[84px]"></div> {/* Spacer for symmetry */}
        </div>
      </div>
    </div>
  );
}
