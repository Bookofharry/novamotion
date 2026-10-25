import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { PromptStudio } from './components/PromptStudio.js';
import { VideoPlayer } from './components/VideoPlayer.js';
import { JobDrawer } from './components/JobDrawer.js';
import { VideoGallery } from './components/VideoGallery.js';
import { ModelStatus } from './components/ModelStatus.js';
import { 
  VideoModelInfo, 
  VideoJob, 
  UserCredits, 
  GenerateVideoRequest 
} from '@videolab/shared';
import { 
  fetchModels, 
  fetchCredits, 
  fetchJobs, 
  submitGeneration, 
  cancelJob 
} from './services/api.js';

export function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery' | 'models'>('studio');
  const [models, setModels] = useState<VideoModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<VideoModelInfo | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJobDrawerOpen, setIsJobDrawerOpen] = useState(false);
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'studio' && (
          <div className="space-y-8">
            {/* Top Showcase: Active Player */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                  <h2 className="font-display font-bold text-lg text-white">Preview Canvas</h2>
                </div>
                {activeVideo.title && (
                  <span className="text-xs text-slate-400 font-mono truncate max-w-md">
                    &quot;{activeVideo.title}&quot;
                  </span>
                )}
              </div>
              <VideoPlayer
                videoUrl={activeVideo.url}
                thumbnailUrl={activeVideo.thumb}
                aspectRatio={activeVideo.ratio}
                title={activeVideo.title}
              />
            </div>

            {/* Bottom: Prompt & Parameter Studio */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-display font-bold text-lg text-white">Generation Studio</h2>
                <span className="text-xs text-slate-400">Configure prompt, camera, and model parameters</span>
              </div>
              <PromptStudio
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                onSubmit={handleGenerateSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <VideoGallery
            jobs={jobs}
            onSelectVideo={handleSelectJobForPlayer}
          />
        )}

        {activeTab === 'models' && (
          <ModelStatus models={models} />
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
    </div>
  );
}

export default App;
