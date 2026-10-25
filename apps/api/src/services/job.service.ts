import { GenerateVideoRequest, VideoJob, VideoModelInfo } from '@videolab/shared';
import { v4 as uuidv4 } from 'uuid';
import { AVAILABLE_MODELS } from '../config.js';

class JobService {
  private jobs: Map<string, VideoJob> = new Map();

  createJob(request: GenerateVideoRequest, model: VideoModelInfo): VideoJob {
    const id = uuidv4();
    const now = new Date().toISOString();
    const creditsUsed = request.duration * model.costPerSecond;

    const job: VideoJob = {
      id,
      prompt: request.prompt,
      enhancedPrompt: request.enhancedPrompt,
      negativePrompt: request.negativePrompt,
      referenceImageUrl: request.referenceImageUrl,
      modelId: model.id,
      provider: model.provider,
      status: 'PENDING',
      progress: 0,
      aspectRatio: request.aspectRatio,
      duration: request.duration,
      resolution: request.resolution,
      creditsUsed,
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(id, job);
    return job;
  }

  getJob(id: string): VideoJob | undefined {
    return this.jobs.get(id);
  }

  getAllJobs(): VideoJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  updateJob(id: string, updates: Partial<VideoJob>): VideoJob | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updated: VideoJob = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
      completedAt: updates.status === 'COMPLETED' || updates.status === 'FAILED' || updates.status === 'CANCELLED' 
        ? new Date().toISOString() 
        : job.completedAt,
    };

    this.jobs.set(id, updated);
    return updated;
  }
}

export const jobService = new JobService();
