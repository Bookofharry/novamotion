import { GenerateVideoRequest, VideoJob } from '@videolab/shared';
import { IVideoProvider, ProviderInitiateResult, ProviderStatusResult } from './provider.interface.js';
import { CONFIG } from '../config.js';

export class RunwayVideoProvider implements IVideoProvider {
  readonly providerId = 'runway';
  private get apiKey(): string {
    return CONFIG.RUNWAY_API_KEY;
  }

  private mapAspectRatio(ratio: string): string {
    if (ratio === '9:16') return '768:1280';
    return '1280:768'; // default 16:9
  }

  async generateVideo(job: VideoJob, request: GenerateVideoRequest): Promise<ProviderInitiateResult> {
    if (!this.apiKey) {
      throw new Error(
        'Runway API Key is missing. Please set RUNWAY_API_KEY in your environment or Settings modal, or use the VideoLab Ultra-Fast (Dev Mock) model.'
      );
    }

    const promptText = request.enhancedPrompt || request.prompt;
    const isImageToVideo = Boolean(request.referenceImageUrl);

    const payload: Record<string, any> = {
      model: request.modelId === 'runway-gen2' ? 'gen2' : 'gen3a_turbo',
      promptText,
      duration: request.duration,
      ratio: this.mapAspectRatio(request.aspectRatio),
    };

    if (isImageToVideo) {
      payload.promptImage = request.referenceImageUrl;
    }

    if (request.seed) {
      payload.seed = request.seed;
    }

    try {
      const response = await fetch('https://api.dev.runwayml.com/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Runway-Version': '2024-09-13',
        },
        body: JSON.stringify(payload),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Runway API error: ${response.statusText}`);
      }

      return {
        providerJobId: data.id,
        initialStatus: data.status === 'RUNNING' ? 'PROCESSING' : 'QUEUED',
      };
    } catch (err: any) {
      console.error('[RunwayProvider Error]:', err);
      throw new Error(`Failed to initiate Runway video generation: ${err.message}`);
    }
  }

  async checkStatus(providerJobId: string): Promise<ProviderStatusResult> {
    if (!this.apiKey) {
      return {
        status: 'FAILED',
        progress: 0,
        errorMessage: 'Runway API Key is missing',
      };
    }

    try {
      const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${providerJobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Runway-Version': '2024-09-13',
        },
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Runway poll failed: ${response.statusText}`);
      }

      if (data.status === 'SUCCEEDED' && data.output && data.output.length > 0) {
        return {
          status: 'COMPLETED',
          progress: 100,
          resultVideoUrl: data.output[0],
          thumbnailUrl: data.output[0],
        };
      }

      if (data.status === 'FAILED') {
        return {
          status: 'FAILED',
          progress: 0,
          errorMessage: data.failure || data.failureCode || 'Generation failed on Runway service',
        };
      }

      if (data.status === 'CANCELLED') {
        return {
          status: 'CANCELLED',
          progress: 0,
        };
      }

      const rawProgress = typeof data.progress === 'number' ? data.progress : 0.5;
      const progress = Math.min(98, Math.max(10, Math.floor(rawProgress * 100)));

      return {
        status: 'PROCESSING',
        progress,
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        progress: 0,
        errorMessage: err.message || 'Runway status check encountered an error',
      };
    }
  }

  async cancel(providerJobId: string): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${providerJobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Runway-Version': '2024-09-13',
        },
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}
