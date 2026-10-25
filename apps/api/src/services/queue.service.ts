import { GenerateVideoRequest, VideoJob } from '@videolab/shared';
import { providerRegistry } from '../providers/provider.registry.js';
import { jobService } from './job.service.js';

class QueueService {
  private activePollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  async enqueue(job: VideoJob, request: GenerateVideoRequest) {
    // Mark job as QUEUED
    jobService.updateJob(job.id, { status: 'QUEUED' });

    // Schedule processing asynchronously
    setTimeout(async () => {
      await this.processJob(job.id, request);
    }, 100);
  }

  private async processJob(jobId: string, request: GenerateVideoRequest) {
    const job = jobService.getJob(jobId);
    if (!job) return;

    try {
      const provider = providerRegistry.get(job.provider);
      
      // Initiate generation with the specific provider adapter
      jobService.updateJob(jobId, { status: 'PROCESSING', progress: 5 });
      const initResult = await provider.generateVideo(job, request);

      jobService.updateJob(jobId, {
        providerJobId: initResult.providerJobId,
        status: initResult.initialStatus,
      });

      // Poll provider for completion and progress updates
      const pollTimer = setInterval(async () => {
        try {
          const currentJob = jobService.getJob(jobId);
          if (!currentJob || currentJob.status === 'CANCELLED') {
            clearInterval(pollTimer);
            this.activePollingIntervals.delete(jobId);
            return;
          }

          const statusResult = await provider.checkStatus(initResult.providerJobId);

          jobService.updateJob(jobId, {
            status: statusResult.status,
            progress: statusResult.progress,
            resultVideoUrl: statusResult.resultVideoUrl,
            thumbnailUrl: statusResult.thumbnailUrl,
            errorMessage: statusResult.errorMessage,
          });

          if (statusResult.status === 'COMPLETED' || statusResult.status === 'FAILED' || statusResult.status === 'CANCELLED') {
            clearInterval(pollTimer);
            this.activePollingIntervals.delete(jobId);
          }
        } catch (pollErr: any) {
          clearInterval(pollTimer);
          this.activePollingIntervals.delete(jobId);
          jobService.updateJob(jobId, {
            status: 'FAILED',
            errorMessage: pollErr?.message || 'Polling error occurred',
          });
        }
      }, 1000);

      this.activePollingIntervals.set(jobId, pollTimer);

    } catch (err: any) {
      jobService.updateJob(jobId, {
        status: 'FAILED',
        errorMessage: err?.message || 'Failed to initiate video generation job',
      });
    }
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = jobService.getJob(jobId);
    if (!job) return false;

    // Stop polling
    const timer = this.activePollingIntervals.get(jobId);
    if (timer) {
      clearInterval(timer);
      this.activePollingIntervals.delete(jobId);
    }

    if (job.providerJobId) {
      try {
        const provider = providerRegistry.get(job.provider);
        await provider.cancel(job.providerJobId);
      } catch (e) {
        // Continue cancellation regardless of provider remote response
      }
    }

    jobService.updateJob(jobId, { status: 'CANCELLED' });
    return true;
  }
}

export const queueService = new QueueService();
