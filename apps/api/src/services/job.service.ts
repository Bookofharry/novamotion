import { GenerateVideoRequest, VideoJob, VideoModelInfo } from '@videolab/shared';
import { prisma } from '@videolab/database';
import { v4 as uuidv4 } from 'uuid';

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

    let ratePerSecond = model.costPerSecond;
    if (request.resolution === '480p') ratePerSecond = 2;
    else if (request.resolution === '720p') ratePerSecond = 3;
    else if (request.resolution === '1080p') ratePerSecond = 14;

    let creditsUsed = request.duration * ratePerSecond;
    if (request.referenceImageUrl) {
      creditsUsed += 1; // 1 credit for reference start frame
    }

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

    this.jobsCache.set(id, job);

    // Asynchronously persist to database
    prisma.videoJob.create({
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
    }).catch(e => console.warn('[JobService] DB persist error on create:', e.message));

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

    // Persist status updates asynchronously (especially on progress change or completion)
    if (updates.status || updates.resultVideoUrl || updates.progress === 100 || updates.errorMessage) {
      prisma.videoJob.update({
        where: { id },
        data: {
          status: updated.status as any,
          progress: updated.progress,
          resultVideoUrl: updated.resultVideoUrl,
          thumbnailUrl: updated.thumbnailUrl,
          providerJobId: updated.providerJobId,
          errorMessage: updated.errorMessage,
          completedAt: updated.completedAt ? new Date(updated.completedAt) : undefined,
        },
      }).catch(e => console.warn('[JobService] DB persist error on update:', e.message));
    }

    return updated;
  }
}

export const jobService = new JobService();
// Initialize from DB on startup
jobService.init();
