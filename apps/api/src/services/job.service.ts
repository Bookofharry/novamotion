import { GenerateVideoRequest, VideoJob, VideoModelInfo } from '@videolab/shared';
import { prisma } from '@videolab/database';
import { v4 as uuidv4 } from 'uuid';
import { adminService } from './admin.service.js';

class JobService {
  private jobsCache: Map<string, VideoJob> = new Map();
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    try {
      const records = await prisma.videoJob.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      for (const r of records) {
        const job: VideoJob = {
          id: r.id,
          prompt: r.prompt,
          enhancedPrompt: r.enhancedPrompt || undefined,
          negativePrompt: r.negativePrompt || undefined,
          referenceImageUrl: r.referenceImageUrl || undefined,
          modelId: r.modelId,
          provider: r.provider as any,
          providerJobId: r.providerJobId || undefined,
          status: r.status as any,
          progress: r.progress,
          aspectRatio: r.aspectRatio as any,
          duration: r.duration as any,
          resolution: r.resolution as any,
          resultVideoUrl: r.resultVideoUrl || undefined,
          thumbnailUrl: r.thumbnailUrl || undefined,
          creditsUsed: r.creditsUsed,
          errorMessage: r.errorMessage || undefined,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          completedAt: r.completedAt?.toISOString(),
        };
        this.jobsCache.set(job.id, job);
      }
      this.isInitialized = true;
      console.log(`[JobService] Loaded ${records.length} persisted jobs from database.`);
    } catch (err: any) {
      console.warn('[JobService] Database not available, operating in memory mode:', err?.message || err);
    }
  }

  async createJob(request: GenerateVideoRequest, model: VideoModelInfo): Promise<VideoJob> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const wholesaleCredits = adminService.calculateWholesaleCost(
      model.id,
      request.duration,
      request.resolution,
      Boolean(request.referenceImageUrl)
    );
    const creditsUsed = adminService.calculateUserCharge(wholesaleCredits);

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
      providerCostCredits: wholesaleCredits,
      createdAt: now,
      updatedAt: now,
    };

    this.jobsCache.set(id, job);

    // Persist to database
    try {
      await prisma.videoJob.create({
        data: {
          id: job.id,
          prompt: job.prompt,
          enhancedPrompt: job.enhancedPrompt,
          negativePrompt: job.negativePrompt,
          referenceImageUrl: job.referenceImageUrl,
          modelId: job.modelId,
          provider: job.provider,
          status: 'PENDING',
          progress: 0,
          aspectRatio: job.aspectRatio,
          duration: job.duration,
          resolution: job.resolution,
          creditsUsed: job.creditsUsed,
          projectId: request.projectId,
        },
      });
    } catch (e: any) {
      console.warn('[JobService] DB persist error on create:', e.message);
    }

    return job;
  }

  getJob(id: string): VideoJob | undefined {
    return this.jobsCache.get(id);
  }

  getAllJobs(): VideoJob[] {
    return Array.from(this.jobsCache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  updateJob(id: string, updates: Partial<VideoJob>): VideoJob | undefined {
    const job = this.jobsCache.get(id);
    if (!job) return undefined;

    const updated: VideoJob = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
      completedAt: updates.status === 'COMPLETED' || updates.status === 'FAILED' || updates.status === 'CANCELLED' 
        ? new Date().toISOString() 
        : job.completedAt,
    };

    this.jobsCache.set(id, updated);

    // Persist status updates (using upsert so record is never reported missing)
    if (updates.status || updates.resultVideoUrl || updates.progress === 100 || updates.errorMessage) {
      prisma.videoJob.upsert({
        where: { id },
        update: {
          status: updated.status as any,
          progress: updated.progress,
          resultVideoUrl: updated.resultVideoUrl,
          thumbnailUrl: updated.thumbnailUrl,
          providerJobId: updated.providerJobId,
          errorMessage: updated.errorMessage,
          completedAt: updated.completedAt ? new Date(updated.completedAt) : undefined,
        },
        create: {
          id: updated.id,
          prompt: updated.prompt,
          enhancedPrompt: updated.enhancedPrompt,
          negativePrompt: updated.negativePrompt,
          referenceImageUrl: updated.referenceImageUrl,
          modelId: updated.modelId,
          provider: updated.provider,
          status: updated.status as any,
          progress: updated.progress,
          aspectRatio: updated.aspectRatio,
          duration: updated.duration,
          resolution: updated.resolution,
          creditsUsed: updated.creditsUsed,
          errorMessage: updated.errorMessage,
        },
      }).catch(e => console.warn('[JobService] DB persist error on update:', e.message));
    }

    return updated;
  }

  async deleteJob(id: string): Promise<boolean> {
    this.jobsCache.delete(id);
    try {
      await prisma.videoJob.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export const jobService = new JobService();
// Initialize from DB on startup
jobService.init();
