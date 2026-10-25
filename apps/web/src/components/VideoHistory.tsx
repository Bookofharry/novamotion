import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  RotateCcw, 
  Sparkles, 
  Film, 
  Clock, 
  Coins, 
  ExternalLink, 
  Calendar,
  Layers,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { VideoJob } from '@videolab/shared';
import { deleteJob } from '../services/api.js';

interface VideoHistoryProps {
  jobs: VideoJob[];
  onSelectVideoForPlayer: (job: VideoJob) => void;
  onRemixInStudio: (job: VideoJob) => void;
  onGoToStudio: () => void;
  onRefreshJobs: () => Promise<void>;
}

export const VideoHistory: React.FC<VideoHistoryProps> = ({
  jobs,
  onSelectVideoForPlayer,
  onRemixInStudio,
  onGoToStudio,
  onRefreshJobs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'COMPLETED' | 'PROCESSING' | 'FAILED'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Filtered list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'PROCESSING') {
          if (job.status !== 'PROCESSING' && job.status !== 'QUEUED' && job.status !== 'PENDING') return false;
        } else if (job.status !== statusFilter) {
          return false;
        }
      }

      // Model filter
      if (selectedModelFilter !== 'all' && job.modelId !== selectedModelFilter) {
        return false;
      }

      // Search term in prompt
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesPrompt = job.prompt.toLowerCase().includes(query);
        const matchesEnhanced = job.enhancedPrompt?.toLowerCase().includes(query);
        const matchesModel = job.modelId?.toLowerCase().includes(query);
        if (!matchesPrompt && !matchesEnhanced && !matchesModel) return false;
      }

      return true;
    });
  }, [jobs, statusFilter, selectedModelFilter, searchTerm]);

  // Aggregate stats
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED' && j.resultVideoUrl);
  const totalSeconds = completedJobs.reduce((acc, j) => acc + (j.duration || 5), 0);
  const totalCredits = jobs.reduce((acc, j) => acc + (j.creditsUsed || 0), 0);

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this video from your history?')) return;
    setDeletingId(id);
    try {
      await deleteJob(id);
      await onRefreshJobs();
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header & Overview Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Film className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-wide">
              Video Generation History
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Archive of all your generated AI videos, prompts, and render parameters. Play in cinema mode, download MP4s, or remix prompts back into the studio.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onGoToStudio}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create New Video</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-white/10 bg-surface-elevated/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Total Generations</span>
            <span className="text-2xl font-bold font-mono text-white mt-0.5 block">{jobs.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 text-teal-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-white/10 bg-surface-elevated/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Total Video Rendered</span>
            <span className="text-2xl font-bold font-mono text-cyan-300 mt-0.5 block">{totalSeconds} seconds</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-white/10 bg-surface-elevated/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Platform Credits Invested</span>
            <span className="text-2xl font-bold font-mono text-amber-300 mt-0.5 block">{totalCredits} credits</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="glass-panel rounded-xl p-3.5 border border-white/10 bg-surface-elevated/60 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prompt, style, or model..."
            className="w-full bg-surface-elevated text-xs text-slate-200 placeholder:text-slate-500 rounded-lg pl-9 pr-3 py-2 border border-white/10 focus:border-teal-500 outline-none"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({jobs.length})
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                statusFilter === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed ({completedJobs.length})
            </button>
          </div>

          {/* Model Selector Filter */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedModelFilter}
              onChange={(e) => setSelectedModelFilter(e.target.value)}
              className="bg-surface-elevated text-xs text-slate-300 rounded-lg px-2.5 py-1.5 border border-white/10 outline-none focus:border-teal-500 font-medium"
            >
              <option value="all">All Models</option>
              <option value="grok-imagine-1-5-lite">Grok Imagine 1.5 Lite</option>
              <option value="runway-lite">Runway Lite</option>
              <option value="gen4-turbo">Gen-4 Turbo</option>
              <option value="wan3-prime">WAN 3.0 Prime</option>
              <option value="h3-max">MiniMax H3 Max</option>
            </select>
          </div>
        </div>

      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 max-w-xl mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto text-teal-400 shadow-lg shadow-teal-500/10">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">No Videos Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {jobs.length === 0 
                ? "You haven't generated any videos yet. Head over to the studio to create your first AI scene!"
                : "No video generations matched your search or filter query."}
            </p>
          </div>
          <button
            onClick={onGoToStudio}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/25 hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Open Studio & Generate Video
          </button>
        </div>
      ) : (
        /* Video Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const isCompleted = job.status === 'COMPLETED' && Boolean(job.resultVideoUrl);
            const isProcessing = job.status === 'PROCESSING' || job.status === 'QUEUED' || job.status === 'PENDING';
            const isPlayingInline = activeVideoId === job.id;

            return (
              <div
                key={job.id}
                className="group glass-panel rounded-2xl border border-white/10 hover:border-teal-500/40 transition-all flex flex-col justify-between overflow-hidden shadow-lg bg-surface-elevated/80"
              >
                {/* Media Preview Player / Thumbnail */}
                <div className="relative aspect-video bg-black/80 overflow-hidden">
                  {isPlayingInline && job.resultVideoUrl ? (
                    <video
                      src={job.resultVideoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <>
                      <img
                        src={job.thumbnailUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60'}
                        alt={job.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Play overlay for completed videos */}
                      {isCompleted && (
                        <div
                          onClick={() => setActiveVideoId(job.id)}
                          className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center cursor-pointer transition-colors"
                          title="Click to play inline"
                        >
                          <div className="w-12 h-12 rounded-full bg-teal-500/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Processing overlay */}
                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center space-y-2">
                          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-semibold text-teal-300">
                            Rendering Video ({job.progress || 0}%)
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Top Overlay Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-teal-300 border border-white/10 font-mono">
                      {job.aspectRatio || '16:9'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-white border border-white/10 font-mono">
                      {job.duration || 5}s
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-slate-300 border border-white/10">
                      {job.resolution || '720p'}
                    </span>
                  </div>

                  {/* Top Right Model Badge */}
                  <div className="absolute top-2.5 right-2.5 pointer-events-none">
                    <span className="px-2 py-0.5 rounded bg-teal-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                      {job.modelId
                        .replace('runway-lite', 'Runway Lite')
                        .replace('grok-imagine-1-5-lite', 'Grok Lite')
                        .replace('gen4-turbo', 'Gen-4 Turbo')
                        .replace('wan3-prime', 'WAN 3.0')
                        .replace('h3-max', 'MiniMax')}
                    </span>
                  </div>
                </div>

                {/* Video Info & Prompt Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-xs font-medium text-slate-100 line-clamp-3 leading-relaxed">
                        &quot;{job.prompt}&quot;
                      </p>
                      <button
                        onClick={() => handleCopyPrompt(job.id, job.prompt)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                        title="Copy prompt"
                      >
                        {copiedId === job.id ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {job.enhancedPrompt && (
                      <p className="text-[11px] text-purple-300/80 line-clamp-2 mt-1 font-mono bg-purple-950/20 p-2 rounded-lg border border-purple-500/20">
                        ✨ {job.enhancedPrompt}
                      </p>
                    )}
                  </div>

                  {/* Bottom Meta & Action Controls */}
                  <div className="pt-3 border-t border-white/5 space-y-2.5">
                    
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-[10px]">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(job.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="text-teal-400 font-semibold">
                        {job.creditsUsed || 0} credits
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      
                      {/* Remix in Studio button */}
                      <button
                        type="button"
                        onClick={() => onRemixInStudio(job)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        title="Load this prompt and settings in the Generation Studio"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Remix</span>
                      </button>

                      {/* Download */}
                      {job.resultVideoUrl && (
                        <a
                          href={job.resultVideoUrl}
                          download={`novamotion-${job.id}.mp4`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                          title="Download high-res MP4"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Open in studio player */}
                      {job.resultVideoUrl && (
                        <button
                          type="button"
                          onClick={() => onSelectVideoForPlayer(job)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                          title="Open in Studio Canvas Previewer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id)}
                        disabled={deletingId === job.id}
                        className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors disabled:opacity-40"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
