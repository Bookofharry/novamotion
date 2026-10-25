import React, { useState, useEffect } from 'react';
import { 
  Clapperboard, 
  Plus, 
  X, 
  ArrowRight, 
  Play, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  Scissors, 
  Music,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { VideoJob, TransitionType, AudioTrackInfo } from '@videolab/shared';
import { mergeClips, trimClip, fetchAudioTracks, addAudioToVideo } from '../services/api.js';

interface ClipSequencerProps {
  jobs: VideoJob[];
  onPlayComposite: (videoUrl: string, title: string) => void;
}

interface TimelineItem {
  uid: string;
  job: VideoJob;
  customVideoUrl?: string;
  isTrimmed?: boolean;
}

export const ClipSequencer: React.FC<ClipSequencerProps> = ({ jobs, onPlayComposite }) => {
  const completedClips = jobs.filter(j => j.status === 'COMPLETED' && j.resultVideoUrl);
  
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [transition, setTransition] = useState<TransitionType>('cut');
  const [isMerging, setIsMerging] = useState(false);
  const [lastMergedUrl, setLastMergedUrl] = useState<string | null>(null);

  // Trimming modal state
  const [trimmingItem, setTrimmingItem] = useState<TimelineItem | null>(null);
  const [trimStartSec, setTrimStartSec] = useState<number>(0);
  const [trimDurationSec, setTrimDurationSec] = useState<number>(3);
  const [isTrimming, setIsTrimming] = useState<boolean>(false);

  // Audio track state
  const [audioTracks, setAudioTracks] = useState<AudioTrackInfo[]>([]);
  const [selectedAudioTrackId, setSelectedAudioTrackId] = useState<string>('none');

  useEffect(() => {
    fetchAudioTracks().then(setAudioTracks).catch(console.error);
  }, []);

  const addClipToTimeline = (job: VideoJob) => {
    const newItem: TimelineItem = {
      uid: `${job.id}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      job,
    };
    setTimeline([...timeline, newItem]);
  };

  const removeTimelineItem = (index: number) => {
    const updated = [...timeline];
    updated.splice(index, 1);
    setTimeline(updated);
  };

  const moveItem = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= timeline.length) return;
    const updated = [...timeline];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTimeline(updated);
  };

  const openTrimModal = (item: TimelineItem) => {
    setTrimmingItem(item);
    setTrimStartSec(0);
    setTrimDurationSec(Math.min(3, item.job.duration || 5));
  };

  const handleApplyTrim = async () => {
    if (!trimmingItem) return;
    setIsTrimming(true);
    try {
      const sourceUrl = trimmingItem.customVideoUrl || trimmingItem.job.resultVideoUrl!;
      const res = await trimClip(sourceUrl, trimStartSec, trimDurationSec);
      
      setTimeline(timeline.map(item => {
        if (item.uid === trimmingItem.uid) {
          return {
            ...item,
            customVideoUrl: res.outputVideoUrl,
            isTrimmed: true,
          };
        }
        return item;
      }));

      setTrimmingItem(null);
    } catch (err: any) {
      alert(`Failed to trim clip: ${err.message}`);
    } finally {
      setIsTrimming(false);
    }
  };

  const handleMerge = async () => {
    if (timeline.length < 2) return;
    setIsMerging(true);
    setLastMergedUrl(null);
    try {
      const urls = timeline.map(c => c.customVideoUrl || c.job.resultVideoUrl!);
      let result = await mergeClips(urls, transition);

      if (selectedAudioTrackId !== 'none') {
        result = await addAudioToVideo({
          videoUrl: result.outputVideoUrl,
          audioTrackId: selectedAudioTrackId,
          volume: 0.8,
          loopAudio: true,
        });
      }

      setLastMergedUrl(result.outputVideoUrl);
      onPlayComposite(result.outputVideoUrl, `Sequenced Composition (${timeline.length} clips)`);
    } catch (err: any) {
      alert(`Stitching failed: ${err.message}`);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-teal-400" /> Multi-Clip Sequencer &amp; Stitcher
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build cinematic sequences by stitching generated clips, trimming timing, and applying seamless transitions.
          </p>
        </div>

        {timeline.length >= 2 && (
          <button
            onClick={handleMerge}
            disabled={isMerging}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isMerging ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Stitching with FFmpeg...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Stitch {timeline.length} Clips
              </>
            )}
          </button>
        )}
      </div>

      {/* Timeline Controls & Settings Strip */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span>Sequence Timeline</span>
            <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px]">
              {timeline.length} clip{timeline.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Transition & Audio Options */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span>Transition:</span>
              <select
                value={transition}
                onChange={(e) => setTransition(e.target.value as TransitionType)}
                className="bg-surface-elevated/70 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="cut">Direct Cut (Instant)</option>
                <option value="crossfade">Crossfade Dissolve</option>
                <option value="fade-to-black">Fade to Black</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span>Soundtrack:</span>
              <select
                value={selectedAudioTrackId}
                onChange={(e) => setSelectedAudioTrackId(e.target.value)}
                className="bg-surface-elevated/70 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="none">None (Silent)</option>
                {audioTracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {timeline.length > 0 && (
              <button
                onClick={() => setTimeline([])}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear Timeline
              </button>
            )}
          </div>
        </div>

        {/* Timeline Horizontal Track */}
        {timeline.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-xl p-8 text-center bg-surface-elevated/20 text-slate-500 text-xs">
            <p>Your timeline is empty. Click clips from your library below to add them to the sequencer.</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1">
            {timeline.map((item, idx) => (
              <React.Fragment key={item.uid}>
                <div className="relative group shrink-0 w-48 rounded-xl overflow-hidden border border-teal-500/40 bg-black/60 shadow-md">
                  <div className="aspect-video relative">
                    <img
                      src={item.job.thumbnailUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800'}
                      alt={item.job.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-teal-500 text-slate-950 text-[10px] font-bold flex items-center justify-center shadow">
                      {idx + 1}
                    </div>

                    {item.isTrimmed && (
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-500/40 text-[9px] font-mono flex items-center gap-1">
                        <Scissors className="w-2.5 h-2.5" /> Trimmed
                      </div>
                    )}

                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                      <button
                        onClick={() => openTrimModal(item)}
                        className="p-1 rounded-full bg-black/70 hover:bg-teal-500 text-white transition-colors"
                        title="Trim clip"
                      >
                        <Scissors className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeTimelineItem(idx)}
                        className="p-1 rounded-full bg-black/70 hover:bg-rose-500 text-white transition-colors"
                        title="Remove clip"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 space-y-1.5">
                    <p className="text-[10px] text-slate-300 truncate font-medium">
                      {item.job.prompt}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{item.job.aspectRatio}</span>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveItem(idx, 'left')}
                          className="p-0.5 rounded hover:bg-white/10 disabled:opacity-20"
                          title="Move left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === timeline.length - 1}
                          onClick={() => moveItem(idx, 'right')}
                          className="p-0.5 rounded hover:bg-white/10 disabled:opacity-20"
                          title="Move right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {idx < timeline.length - 1 && (
                  <div className="flex flex-col items-center gap-0.5 shrink-0 text-teal-400/60">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-[9px] font-mono uppercase text-slate-500">{transition}</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Success Banner */}
        {lastMergedUrl && (
          <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 flex items-center justify-between text-xs text-teal-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Stitching completed successfully! Continuous sequence is ready.
            </span>
            <button
              onClick={() => onPlayComposite(lastMergedUrl, 'Stitched Video Sequence')}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-500 text-slate-950 font-bold text-[11px] hover:bg-teal-400 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" /> Watch in Canvas
            </button>
          </div>
        )}
      </div>

      {/* Available Clips Selection Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Add Clips from Video Library ({completedClips.length})
        </h3>

        {completedClips.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center border border-white/10 text-xs text-slate-500">
            No completed clips available yet. Generate videos in the Studio first to stitch them here.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {completedClips.map((clip) => (
              <div
                key={clip.id}
                onClick={() => addClipToTimeline(clip)}
                className="cursor-pointer rounded-xl border p-2.5 transition-all text-left flex flex-col justify-between bg-surface-elevated/40 border-white/5 hover:border-teal-500/50 hover:shadow-md"
              >
                <div className="aspect-video relative rounded-lg overflow-hidden mb-2 bg-black">
                  <img
                    src={clip.thumbnailUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800'}
                    alt={clip.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                  {clip.prompt}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-white/5">
                  <span>{clip.aspectRatio}</span>
                  <span>{clip.duration}s</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Clip Trimming Modal */}
      {trimmingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl p-6 border border-teal-500/30 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-teal-400" /> Trim Video Clip
              </h3>
              <button
                onClick={() => setTrimmingItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
              <video
                src={trimmingItem.customVideoUrl || trimmingItem.job.resultVideoUrl}
                controls
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span>Start Offset (Seconds)</span>
                  <span className="font-mono text-teal-300">{trimStartSec}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={(trimmingItem.job.duration || 5) - 1}
                  step="0.5"
                  value={trimStartSec}
                  onChange={(e) => setTrimStartSec(parseFloat(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span>Clip Duration (Seconds)</span>
                  <span className="font-mono text-teal-300">{trimDurationSec}s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={(trimmingItem.job.duration || 5) - trimStartSec}
                  step="0.5"
                  value={trimDurationSec}
                  onChange={(e) => setTrimDurationSec(parseFloat(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTrimmingItem(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyTrim}
                disabled={isTrimming}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors disabled:opacity-50"
              >
                {isTrimming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scissors className="w-3.5 h-3.5" />}
                Save Trim
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
