import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Download, Film } from 'lucide-react';
import { AspectRatio } from '@videolab/shared';

interface VideoPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  aspectRatio?: AspectRatio;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  aspectRatio = '16:9',
  title,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(current);
    setDuration(dur);
    setProgress((current / dur) * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const targetTime = (parseFloat(e.target.value) / 100) * (duration || 1);
    videoRef.current.currentTime = targetTime;
    setProgress(parseFloat(e.target.value));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (secs: number) => {
    const s = Math.floor(secs);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // Compute aspect ratio CSS class or style
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[600px] mx-auto';
      case '1:1':
        return 'aspect-square max-h-[550px] mx-auto';
      case '4:3':
        return 'aspect-[4/3] max-h-[550px] mx-auto';
      case '21:9':
        return 'aspect-[21/9] w-full';
      case '16:9':
      default:
        return 'aspect-video w-full';
    }
  };

  if (!videoUrl) {
    return (
      <div className={`relative rounded-2xl border border-white/10 glass-panel overflow-hidden flex flex-col items-center justify-center p-8 bg-surface/50 ${getAspectRatioClass()}`}>
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-slate-500">
          <Film className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-slate-300">No Video Active</p>
        <p className="text-xs text-slate-500 text-center max-w-sm mt-1">
          Type a cinematic prompt or pick a preset below, then click &quot;Generate Video&quot; to preview your scene here.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`group relative rounded-2xl border border-white/10 bg-black overflow-hidden shadow-2xl transition-all ${getAspectRatioClass()}`}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Center Play Overlay Button */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-teal-500/90 text-slate-950 flex items-center justify-center shadow-xl shadow-teal-500/40 hover:scale-110 transition-transform">
            <Play className="w-7 h-7 fill-slate-950 translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Control Bar Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Seek Bar */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 hover:text-teal-400 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              className="p-1.5 hover:text-teal-400 transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleMute}
              className="p-1.5 hover:text-teal-400 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {title && (
              <span className="truncate max-w-[200px] text-[11px] text-slate-400 mr-2">
                {title}
              </span>
            )}
            <a
              href={videoUrl}
              download="videolab-render.mp4"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 hover:text-teal-400 transition-colors"
              title="Download MP4"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-teal-400 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
