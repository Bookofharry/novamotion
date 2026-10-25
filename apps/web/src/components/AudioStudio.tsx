import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Radio, 
  Film,
  Sliders,
  Disc3
} from 'lucide-react';
import { AudioTrackInfo, VideoJob } from '@videolab/shared';
import { fetchAudioTracks, addAudioToVideo } from '../services/api.js';

interface AudioStudioProps {
  jobs: VideoJob[];
  onPlayEnhancedVideo: (videoUrl: string, title: string) => void;
}

export const AudioStudio: React.FC<AudioStudioProps> = ({ jobs, onPlayEnhancedVideo }) => {
  const [tracks, setTracks] = useState<AudioTrackInfo[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrackInfo | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [selectedVideoJobId, setSelectedVideoJobId] = useState<string>('');
  const [volume, setVolume] = useState<number>(0.75);
  const [isMuxing, setIsMuxing] = useState<boolean>(false);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const completedVideos = jobs.filter(j => j.status === 'COMPLETED' && j.resultVideoUrl);

  useEffect(() => {
    fetchAudioTracks()
      .then(t => {
        setTracks(t);
        if (t.length > 0) setSelectedTrack(t[0]);
      })
      .catch(console.error);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (completedVideos.length > 0 && !selectedVideoJobId) {
      setSelectedVideoJobId(completedVideos[0].id);
    }
  }, [completedVideos]);

  const togglePlayTrack = (track: AudioTrackInfo) => {
    if (playingTrackId === track.id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingTrackId(null);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = track.audioUrl;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(console.error);
      audioRef.current.onended = () => setPlayingTrackId(null);
      setPlayingTrackId(track.id);
      setSelectedTrack(track);
    }
  };

  const handleApplyAudio = async () => {
    if (!selectedTrack || !selectedVideoJobId) return;
    const targetJob = completedVideos.find(j => j.id === selectedVideoJobId);
    if (!targetJob?.resultVideoUrl) return;

    setIsMuxing(true);
    setResultVideoUrl(null);
    try {
      const res = await addAudioToVideo({
        videoUrl: targetJob.resultVideoUrl,
        audioTrackId: selectedTrack.id,
        volume: volume,
        loopAudio: true,
      });

      setResultVideoUrl(res.outputVideoUrl);
      onPlayEnhancedVideo(res.outputVideoUrl, `${targetJob.prompt} (${selectedTrack.title})`);
    } catch (err: any) {
      alert(`Audio enhancement failed: ${err.message}`);
    } finally {
      setIsMuxing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Studio Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-400" /> Audio &amp; Sound Effects Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generative AI video clips are silent by default. Overlay cinematic soundscapes, rhythmic synthwave pulses, or nature ambience directly into your videos with FFmpeg.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Soundscapes Selector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" /> Curated Soundscapes &amp; Ambient Scores ({tracks.length})
            </h3>
            {playingTrackId && (
              <span className="flex items-center gap-1.5 text-xs text-purple-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                Preview Playing
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {tracks.map((track) => {
              const isSelected = selectedTrack?.id === track.id;
              const isPlaying = playingTrackId === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrack(track)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-950/20 border-purple-500 shadow-lg shadow-purple-500/10'
                      : 'bg-surface-elevated/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlayTrack(track);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 ${
                          isPlaying
                            ? 'bg-purple-500 text-white animate-pulse'
                            : 'bg-white/10 hover:bg-purple-500 hover:text-white text-slate-200'
                        }`}
                        title={isPlaying ? 'Pause preview' : 'Play preview'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                      </button>
                      <div>
                        <h4 className="text-xs font-semibold text-white leading-snug">{track.title}</h4>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-purple-300 border border-purple-500/20 mt-1 inline-block">
                          {track.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {track.mood}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-2">
                    <span className="flex items-center gap-1">
                      <Disc3 className="w-3 h-3 text-purple-400" /> Procedural Synthesized
                    </span>
                    <span>{track.durationSec}s loop</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Video & Muxing Panel */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" /> Apply Soundtrack to Video
            </h3>

            {/* Target Video Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-purple-400" /> Select Target Video
              </label>

              {completedVideos.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-xs text-slate-500 text-center">
                  No completed videos available in your library yet. Generate a video in the Studio first!
                </div>
              ) : (
                <select
                  value={selectedVideoJobId}
                  onChange={(e) => setSelectedVideoJobId(e.target.value)}
                  className="w-full bg-surface-elevated/70 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {completedVideos.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.prompt.substring(0, 50)}... ({job.duration}s, {job.aspectRatio})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Volume Mixer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Soundtrack Volume
                </span>
                <span className="font-mono text-purple-300">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (audioRef.current) audioRef.current.volume = Math.min(1, val);
                }}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Selected Soundtrack Summary */}
            {selectedTrack && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Active Soundtrack</span>
                <p className="text-white font-semibold">{selectedTrack.title}</p>
                <p className="text-slate-400 text-[11px]">{selectedTrack.mood}</p>
              </div>
            )}

            {/* Submit Muxing Button */}
            <button
              onClick={handleApplyAudio}
              disabled={isMuxing || !selectedTrack || !selectedVideoJobId}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMuxing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Muxing Audio with FFmpeg...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Mux Soundtrack onto Video
                </>
              )}
            </button>

            {/* Output Success Banner */}
            {resultVideoUrl && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Soundtrack muxed successfully!
                </span>
                <button
                  onClick={() => onPlayEnhancedVideo(resultVideoUrl, 'Audio Enhanced Video')}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] hover:bg-emerald-400 transition-colors"
                >
                  Watch Now
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
