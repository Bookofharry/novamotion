import { useState, useEffect, useCallback } from 'react';
import { Play, Layers, Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar.js';
import { PromptStudio } from './components/PromptStudio.js';
import { VideoPlayer } from './components/VideoPlayer.js';
import { JobDrawer } from './components/JobDrawer.js';
import { VideoGallery } from './components/VideoGallery.js';
import { SettingsModal } from './components/SettingsModal.js';
import { 
  VideoModelInfo, 
  VideoJob, 
  UserCredits, 
  GenerateVideoRequest 
} from '@videolab/shared';
import { AdminStudio } from './components/AdminStudio.js';
import { PricingModal } from './components/PricingModal.js';
import { 
  fetchModels, 
  fetchCredits, 
  fetchJobs, 
  submitGeneration, 
  cancelJob 
} from './services/api.js';

export function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery' | 'admin'>('studio');
  const [models, setModels] = useState<VideoModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<VideoModelInfo | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJobDrawerOpen, setIsJobDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{
    url?: string;
    thumb?: string;
    ratio?: any;
    title?: string;
  }>({});

  // Initial load
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [loadedModels, loadedCredits, loadedJobs] = await Promise.all([
          fetchModels(),
          fetchCredits(),
          fetchJobs(),
        ]);
        setModels(loadedModels);
        const defaultMod = loadedModels.find(m => m.isDefault) || loadedModels[0] || null;
        setSelectedModel(defaultMod);
        setCredits(loadedCredits);
        setJobs(loadedJobs);

        // If there's an existing completed job, load it into player
        const latestDone = loadedJobs.find(j => j.status === 'COMPLETED' && j.resultVideoUrl);
        if (latestDone) {
          setActiveVideo({
            url: latestDone.resultVideoUrl,
            thumb: latestDone.thumbnailUrl,
            ratio: latestDone.aspectRatio,
            title: latestDone.prompt,
          });
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }
    loadInitialData();
  }, []);

  // Poll jobs if any job is currently pending/queued/processing
  const activeJobs = jobs.filter(
    (j) => j.status === 'PENDING' || j.status === 'QUEUED' || j.status === 'PROCESSING'
  );

  const refreshJobs = useCallback(async () => {
    try {
      const updatedJobs = await fetchJobs();
      setJobs(updatedJobs);

      // Check if any job completed that wasn't displayed
      const latestDone = updatedJobs.find(j => j.status === 'COMPLETED' && j.resultVideoUrl);
      if (latestDone && !activeVideo.url) {
        setActiveVideo({
          url: latestDone.resultVideoUrl,
          thumb: latestDone.thumbnailUrl,
          ratio: latestDone.aspectRatio,
          title: latestDone.prompt,
        });
      }

      // Also refresh credits
      const creds = await fetchCredits();
      setCredits(creds);
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, [activeVideo.url]);

  useEffect(() => {
    if (activeJobs.length === 0) return;
    const interval = setInterval(refreshJobs, 1500);
    return () => clearInterval(interval);
  }, [activeJobs.length, refreshJobs]);

  const handleGenerateSubmit = async (request: GenerateVideoRequest) => {
    setIsSubmitting(true);
    try {
      const newJob = await submitGeneration(request);
      setJobs((prev) => [newJob, ...prev]);
      setIsJobDrawerOpen(true);
      // Refresh credits
      const creds = await fetchCredits();
      setCredits(creds);
    } catch (err: any) {
      alert(`Generation failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await cancelJob(jobId);
      await refreshJobs();
    } catch (err: any) {
      alert(`Could not cancel job: ${err?.message}`);
    }
  };

  const handleSelectJobForPlayer = (job: VideoJob) => {
    if (job.resultVideoUrl) {
      setActiveVideo({
        url: job.resultVideoUrl,
        thumb: job.thumbnailUrl,
        ratio: job.aspectRatio,
        title: job.prompt,
      });
      setActiveTab('studio');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        credits={credits}
        activeJobsCount={activeJobs.length}
        onOpenJobDrawer={() => setIsJobDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Columns: Video Generation Parameters & Prompt Console */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-teal-500/20 text-teal-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-bold text-lg text-white">Generation Console</h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Real Runway AI Engines Active
                </span>
              </div>

              <PromptStudio
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                onSubmit={handleGenerateSubmit}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Right 5 Columns: Video Player Preview Canvas & Recent Creations */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
              
              {/* Preview Canvas Stage */}
              <div className="glass-panel rounded-2xl border border-white/10 p-4 space-y-3 shadow-xl bg-surface-elevated/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                    <h3 className="font-display font-bold text-sm text-white">Preview Stage</h3>
                  </div>
                  {activeVideo.title && (
                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]" title={activeVideo.title}>
                      &quot;{activeVideo.title}&quot;
                    </span>
                  )}
                </div>

                {/* Live rendering progress indicator if job active */}
                {activeJobs.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-teal-300">
                          Rendering Video ({activeJobs[0].status.toLowerCase()})...
                        </div>
                        <div className="text-[10px] text-teal-400/80 font-mono truncate">
                          {activeJobs[0].prompt}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-400 ml-2">
                      {activeJobs[0].progress || 0}%
                    </span>
                  </div>
                )}

                <VideoPlayer
                  videoUrl={activeVideo.url}
                  thumbnailUrl={activeVideo.thumb}
                  aspectRatio={activeVideo.ratio}
                  title={activeVideo.title}
                />
              </div>

              {/* Recent Creations Shelf */}
              {jobs.filter(j => j.status === 'COMPLETED' && j.resultVideoUrl).length > 0 && (
                <div className="glass-panel rounded-2xl border border-white/10 p-4 space-y-3 bg-surface-elevated/40">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-teal-400" />
                      Recent Creations
                    </h4>
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="text-[11px] text-teal-400 hover:text-teal-300 font-medium transition-colors"
                    >
                      View all ({jobs.filter(j => j.status === 'COMPLETED' && j.resultVideoUrl).length}) →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {jobs
                      .filter(j => j.status === 'COMPLETED' && j.resultVideoUrl)
                      .slice(0, 3)
                      .map((job) => {
                        const isActive = activeVideo.url === job.resultVideoUrl;
                        return (
                          <div
                            key={job.id}
                            onClick={() => handleSelectJobForPlayer(job)}
                            className={`group relative aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all ${
                              isActive
                                ? 'border-teal-400 ring-2 ring-teal-500/30 shadow-md'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <img
                              src={job.thumbnailUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60'}
                              alt={job.prompt}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                              <div className="w-6 h-6 rounded-full bg-teal-500/90 text-slate-950 flex items-center justify-center shadow">
                                <Play className="w-3 h-3 fill-current translate-x-0.5" />
                              </div>
                            </div>
                            <div className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 text-[9px] font-mono text-white rounded">
                              {job.duration || 5}s
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {activeTab === 'gallery' && (
          <VideoGallery
            jobs={jobs}
            onSelectVideo={handleSelectJobForPlayer}
          />
        )}

        {activeTab === 'admin' && (
          <AdminStudio
            onRefreshCredits={async () => {
              const creds = await fetchCredits();
              setCredits(creds);
            }}
            onPreviewVideo={(videoUrl, title) => {
              setActiveVideo({
                url: videoUrl,
                ratio: '16:9',
                title,
              });
              setActiveTab('studio');
            }}
          />
        )}
      </main>

      {/* Job Drawer */}
      <JobDrawer
        isOpen={isJobDrawerOpen}
        onClose={() => setIsJobDrawerOpen(false)}
        jobs={jobs}
        onSelectJob={handleSelectJobForPlayer}
        onCancelJob={handleCancelJob}
      />

      {/* Provider API Keys Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Credit Top-Up Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onCreditPurchased={async () => {
          const creds = await fetchCredits();
          setCredits(creds);
        }}
      />
    </div>
  );
}

export default App;
