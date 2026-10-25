import React from 'react';
import { X, Play, Clock, CheckCircle2, AlertCircle, Ban, Loader2 } from 'lucide-react';
import { VideoJob } from '@videolab/shared';

interface JobDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: VideoJob[];
  onSelectJob: (job: VideoJob) => void;
  onCancelJob: (jobId: string) => void;
}

export const JobDrawer: React.FC<JobDrawerProps> = ({
  isOpen,
  onClose,
  jobs,
  onSelectJob,
  onCancelJob,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-white/10 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Generation Queue</h2>
              <p className="text-xs text-slate-400">Live asynchronous task monitoring</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Jobs List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {jobs.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Clock className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium text-slate-400">No jobs in queue</p>
                <p className="text-xs mt-1">Submit a generation in the Studio to track progress here.</p>
              </div>
            ) : (
              jobs.map((job) => {
                const isRunning = job.status === 'PROCESSING' || job.status === 'QUEUED' || job.status === 'PENDING';
                const isComplete = job.status === 'COMPLETED';
                const isFailed = job.status === 'FAILED';

                return (
                  <div
                    key={job.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isRunning
                        ? 'bg-surface-elevated border-teal-500/40 shadow-sm'
                        : isComplete
                        ? 'bg-surface-elevated/60 border-white/10 hover:border-teal-500/30 cursor-pointer'
                        : 'bg-surface-elevated/40 border-red-500/20'
                    }`}
                    onClick={() => {
                      if (isComplete) {
                        onSelectJob(job);
                        onClose();
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {isRunning && <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />}
                        {isComplete && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {isFailed && <AlertCircle className="w-4 h-4 text-rose-400" />}
                        {job.status === 'CANCELLED' && <Ban className="w-4 h-4 text-slate-400" />}
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                          {job.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(job.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 line-clamp-2 mb-2 font-medium">
                      {job.prompt}
                    </p>

                    {/* Progress Bar for Running Jobs */}
                    {isRunning && (
                      <div className="space-y-1.5 my-3">
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full transition-all duration-300"
                            style={{ width: `${Math.max(5, job.progress)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Rendering frames...</span>
                          <span className="font-mono">{job.progress}%</span>
                        </div>
                      </div>
                    )}

                    {/* Footer Details & Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      <span>
                        {job.aspectRatio} • {job.duration}s • {job.resolution}
                      </span>

                      {isRunning ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelJob(job.id);
                          }}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      ) : isComplete ? (
                        <span className="text-teal-400 flex items-center gap-1 font-medium">
                          <Play className="w-3 h-3 fill-current" /> Watch
                        </span>
                      ) : (
                        <span className="text-rose-400 truncate max-w-[150px]">
                          {job.errorMessage || 'Failed'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
