import React from 'react';
import { Play, Download, Calendar, Layers } from 'lucide-react';
import { VideoJob } from '@videolab/shared';

interface VideoGalleryProps {
  jobs: VideoJob[];
  onSelectVideo: (job: VideoJob) => void;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ jobs, onSelectVideo }) => {
  const completedVideos = jobs.filter((j) => j.status === 'COMPLETED' && j.resultVideoUrl);

  if (completedVideos.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4 text-teal-400">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-xl text-white">Your Video Library is Empty</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Start generating videos in the Studio. All your rendered clips, cinematic scenes, and prompts will be cataloged here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Generated Video Library</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {completedVideos.length} rendered video{completedVideos.length === 1 ? '' : 's'} available
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedVideos.map((job) => (
          <div
            key={job.id}
            className="group glass-panel rounded-2xl border border-white/10 overflow-hidden hover:border-teal-500/40 transition-all hover:shadow-xl hover:shadow-teal-500/5 flex flex-col justify-between"
          >
            {/* Thumbnail Preview with Play Overlay */}
            <div
              onClick={() => onSelectVideo(job)}
              className="relative aspect-video bg-black/60 cursor-pointer overflow-hidden"
            >
              <img
                src={job.thumbnailUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60'}
                alt={job.prompt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-teal-500/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </div>
              </div>

              {/* Badges Overlay */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-semibold text-slate-200 border border-white/10">
                  {job.aspectRatio}
                </span>
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-semibold text-teal-300 border border-white/10">
                  {job.duration}s
                </span>
              </div>
            </div>

            {/* Meta & Prompt details */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-relaxed">
                  {job.prompt}
                </p>
                {job.enhancedPrompt && (
                  <p className="text-[11px] text-purple-300/80 line-clamp-1 mt-1 font-mono">
                    ✨ {job.enhancedPrompt}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={job.resultVideoUrl}
                    download="video.mp4"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-teal-300 transition-colors"
                    title="Download MP4"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onSelectVideo(job)}
                    className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium transition-colors"
                  >
                    Open in Studio
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
