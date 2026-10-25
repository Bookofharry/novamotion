import { GenerateVideoRequest, JobStatus, VideoJob } from '@videolab/shared';
import { IVideoProvider, ProviderInitiateResult, ProviderStatusResult } from './provider.interface.js';

interface MockJobState {
  startedAt: number;
  durationMs: number;
  videoUrl: string;
  thumbnailUrl: string;
  isCancelled?: boolean;
}

// Curated high quality video assets for realistic preview in development
const SAMPLE_VIDEOS = [
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60',
    keywords: ['nature', 'bunny', 'animation', 'forest', 'green', 'peaceful']
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=60',
    keywords: ['cyberpunk', 'futuristic', 'machine', 'dark', 'neon', 'sci-fi']
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumb: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
    keywords: ['space', 'galaxy', 'lights', 'earth', 'cinematic', 'stars']
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=60',
    keywords: ['robot', 'action', 'cyberpunk', 'city', 'dramatic', 'tech']
  }
];

export class MockVideoProvider implements IVideoProvider {
  readonly providerId = 'mock';
  private jobs: Map<string, MockJobState> = new Map();

  async generateVideo(job: VideoJob, request: GenerateVideoRequest): Promise<ProviderInitiateResult> {
    const providerJobId = `mock-job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Pick the best sample or a random one based on prompt keywords
    const lowerPrompt = (request.prompt + ' ' + (request.enhancedPrompt || '')).toLowerCase();
    const matched = SAMPLE_VIDEOS.find(v => v.keywords.some(k => lowerPrompt.includes(k))) || SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];

    // Simulate 6 to 10 seconds generation time
    const durationMs = 6000 + Math.random() * 4000;

    this.jobs.set(providerJobId, {
      startedAt: Date.now(),
      durationMs,
      videoUrl: matched.url,
      thumbnailUrl: matched.thumb,
    });

    return {
      providerJobId,
      initialStatus: 'PROCESSING',
    };
  }

  async checkStatus(providerJobId: string): Promise<ProviderStatusResult> {
    const jobState = this.jobs.get(providerJobId);
    if (!jobState) {
      return {
        status: 'FAILED',
        progress: 0,
        errorMessage: 'Mock job not found',
      };
    }

    if (jobState.isCancelled) {
      return {
        status: 'CANCELLED',
        progress: 0,
      };
    }

    const elapsed = Date.now() - jobState.startedAt;
    const progress = Math.min(100, Math.floor((elapsed / jobState.durationMs) * 100));

    if (progress >= 100) {
      return {
        status: 'COMPLETED',
        progress: 100,
        resultVideoUrl: jobState.videoUrl,
        thumbnailUrl: jobState.thumbnailUrl,
      };
    }

    return {
      status: 'PROCESSING',
      progress,
    };
  }

  async cancel(providerJobId: string): Promise<boolean> {
    const job = this.jobs.get(providerJobId);
    if (job) {
      job.isCancelled = true;
      return true;
    }
    return false;
  }
}
