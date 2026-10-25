import { PlatformAuditSummary, ModelAuditStat, JobAuditDetail } from '@videolab/shared';
import { jobService } from './job.service.js';
import { CONFIG, AVAILABLE_MODELS } from '../config.js';

class AdminService {
  private markupMultiplier: number = 1.25; // 25% margin default
  private extraCreditsAdjusted: number = 0;

  getMarkupMultiplier(): number {
    return this.markupMultiplier;
  }

  setMarkupMultiplier(multiplier: number): number {
    this.markupMultiplier = Math.max(1.0, Math.min(5.0, multiplier));
    return this.markupMultiplier;
  }

  getAdjustedCredits(): number {
    return this.extraCreditsAdjusted;
  }

  adjustCredits(amount: number): number {
    this.extraCreditsAdjusted += amount;
    return this.extraCreditsAdjusted;
  }

  private calculateRunwayCost(job: any): number {
    if (typeof job.providerCostCredits === 'number' && job.providerCostCredits > 0) {
      return job.providerCostCredits;
    }

    const dur = job.duration || 5;
    const modelId = job.modelId;

    if (modelId === 'gen4-turbo') {
      return Math.max(10, dur * 5);
    }
    if (modelId === 'wan3-prime') {
      let rate = 14;
      if (job.resolution === '480p') rate = 6.8;
      else if (job.resolution === '1080p') rate = 28;
      return Math.round(dur * rate * 10) / 10;
    }
    if (modelId === 'h3-max') {
      const rate = job.resolution === '480p' ? 5 : 8;
      return Math.max(5, dur) * rate;
    }
    if (modelId === 'gen4.5') {
      return dur * 12; // 60 credits for 5s
    }

    // Default: Grok Imagine Video 1.5 Lite
    let rate = 3;
    if (job.resolution === '480p') rate = 2;
    else if (job.resolution === '1080p') rate = 14;
    return (dur * rate) + (job.referenceImageUrl ? 1 : 0);
  }

  getAuditSummary(): PlatformAuditSummary {
    const jobs = jobService.getAllJobs();
    const multiplier = this.markupMultiplier;

    let totalRunwayCostCredits = 0;
    let totalUserChargedCredits = 0;
    let completedJobs = 0;
    let failedJobs = 0;
    let processingJobs = 0;

    const modelMap = new Map<string, {
      modelId: string;
      modelName: string;
      totalJobs: number;
      completedJobs: number;
      runwayCostCredits: number;
      userChargedCredits: number;
    }>();

    // Initialize all available models in map
    AVAILABLE_MODELS.forEach(m => {
      modelMap.set(m.id, {
        modelId: m.id,
        modelName: m.name,
        totalJobs: 0,
        completedJobs: 0,
        runwayCostCredits: 0,
        userChargedCredits: 0,
      });
    });

    const detailedJobs: JobAuditDetail[] = jobs.map((job) => {
      const isDone = job.status === 'COMPLETED';
      const isFail = job.status === 'FAILED';
      const isProc = job.status === 'PROCESSING' || job.status === 'QUEUED' || job.status === 'PENDING';

      if (isDone) completedJobs++;
      else if (isFail) failedJobs++;
      else if (isProc) processingJobs++;

      // If failed, provider usually does not charge or charges 0
      const runwayCredits = isFail ? 0 : this.calculateRunwayCost(job);
      const runwayCostUsd = Math.round(runwayCredits * 0.01 * 100) / 100; // $0.01 per credit

      const userCredits = isFail ? 0 : (job.creditsUsed || runwayCredits);
      const userChargedUsd = Math.round(userCredits * 0.01 * multiplier * 100) / 100;
      const marginUsd = Math.round((userChargedUsd - runwayCostUsd) * 100) / 100;

      totalRunwayCostCredits += runwayCredits;
      totalUserChargedCredits += userCredits;

      // Model stats aggregation
      let mStats = modelMap.get(job.modelId);
      if (!mStats) {
        const found = AVAILABLE_MODELS.find(m => m.id === job.modelId);
        mStats = {
          modelId: job.modelId,
          modelName: found ? found.name : job.modelId,
          totalJobs: 0,
          completedJobs: 0,
          runwayCostCredits: 0,
          userChargedCredits: 0,
        };
        modelMap.set(job.modelId, mStats);
      }

      mStats.totalJobs++;
      if (isDone) mStats.completedJobs++;
      mStats.runwayCostCredits += runwayCredits;
      mStats.userChargedCredits += userCredits;

      const modelInfo = AVAILABLE_MODELS.find(m => m.id === job.modelId);

      return {
        id: job.id,
        createdAt: job.createdAt,
        prompt: job.prompt,
        modelId: job.modelId,
        modelName: modelInfo ? modelInfo.name : job.modelId,
        duration: job.duration,
        resolution: job.resolution,
        aspectRatio: job.aspectRatio,
        status: job.status,
        providerCostCredits: runwayCredits,
        providerCostUsd: runwayCostUsd,
        userChargedCredits: userCredits,
        userChargedUsd: userChargedUsd,
        marginUsd,
        resultVideoUrl: job.resultVideoUrl,
        referenceImageUrl: job.referenceImageUrl,
        providerJobId: job.providerJobId,
      };
    });

    const totalRunwayCostUsd = Math.round(totalRunwayCostCredits * 0.01 * 100) / 100;
    const totalUserChargedUsd = Math.round(totalUserChargedCredits * 0.01 * multiplier * 100) / 100;
    const netProfitUsd = Math.round((totalUserChargedUsd - totalRunwayCostUsd) * 100) / 100;
    const marginPercentage = totalUserChargedUsd > 0 
      ? Math.round((netProfitUsd / totalUserChargedUsd) * 1000) / 10 
      : 0;

    const modelStats: ModelAuditStat[] = Array.from(modelMap.values()).map(m => {
      const runwayUsd = Math.round(m.runwayCostCredits * 0.01 * 100) / 100;
      const userUsd = Math.round(m.userChargedCredits * 0.01 * multiplier * 100) / 100;
      return {
        modelId: m.modelId,
        modelName: m.modelName,
        totalJobs: m.totalJobs,
        completedJobs: m.completedJobs,
        runwayCostCredits: m.runwayCostCredits,
        runwayCostUsd: runwayUsd,
        userChargedCredits: m.userChargedCredits,
        userChargedUsd: userUsd,
        marginUsd: Math.round((userUsd - runwayUsd) * 100) / 100,
      };
    });

    return {
      totalJobs: jobs.length,
      completedJobs,
      failedJobs,
      processingJobs,
      totalRunwayCostCredits,
      totalRunwayCostUsd,
      totalUserChargedCredits,
      totalUserChargedUsd,
      netProfitUsd,
      marginPercentage,
      markupMultiplier: multiplier,
      modelStats,
      jobs: detailedJobs,
    };
  }

  async syncJobWithRunway(jobId: string): Promise<any> {
    const job = jobService.getJob(jobId);
    if (!job || !job.providerJobId) {
      throw new Error('Job not found or lacks a provider task ID');
    }

    const apiKey = CONFIG.RUNWAY_API_KEY;
    if (!apiKey) {
      throw new Error('Runway API key is not configured');
    }

    const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${job.providerJobId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-11-06',
      },
    });

    const data: any = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || data?.message || 'Failed to sync with Runway');
    }

    const updates: any = {};
    if (data.status === 'SUCCEEDED') {
      updates.status = 'COMPLETED';
      updates.progress = 100;
      if (data.output && data.output.length > 0) {
        updates.resultVideoUrl = data.output[0];
        updates.thumbnailUrl = data.output[0];
      }
      if (data.cost?.credits) {
        updates.providerCostCredits = data.cost.credits;
      }
    } else if (data.status === 'FAILED') {
      updates.status = 'FAILED';
      updates.errorMessage = data.failure || 'Runway task failed';
    }

    return jobService.updateJob(jobId, updates);
  }

  async testRunwayConnection(): Promise<{ ok: boolean; latencyMs: number; message: string }> {
    const apiKey = CONFIG.RUNWAY_API_KEY;
    if (!apiKey) {
      return { ok: false, latencyMs: 0, message: 'Runway API Key is missing in environment' };
    }

    const start = Date.now();
    try {
      const allJobs = jobService.getAllJobs();
      const sampleJob = allJobs.find(j => j.providerJobId);
      const taskId = sampleJob?.providerJobId || '4ba7dd65-8cb6-43ec-84c2-782ee3619b93';

      const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-11-06',
        },
      });
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        const text = await res.text();
        return { ok: false, latencyMs, message: `Runway returned HTTP ${res.status}: ${text}` };
      }

      return { ok: true, latencyMs, message: `Runway API connected & authorized (${latencyMs}ms latency)` };
    } catch (err: any) {
      return { ok: false, latencyMs: Date.now() - start, message: err.message };
    }
  }
}

export const adminService = new AdminService();
