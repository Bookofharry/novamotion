import { GenerateVideoRequest, VideoJob } from '@videolab/shared';
import { IVideoProvider, ProviderInitiateResult, ProviderStatusResult } from './provider.interface.js';
import { CONFIG } from '../config.js';

export class RunwayVideoProvider implements IVideoProvider {
  readonly providerId = 'runway';
  private get apiKey(): string {
    return CONFIG.RUNWAY_API_KEY;
  }

  private getProviderModel(modelId: string): string {
    switch (modelId) {
      case 'gen4-turbo':
        return 'gen4_turbo';
      case 'wan3-prime':
        return 'wan3_prime';
      case 'h3-max':
        return 'h3_max';
      case 'grok-imagine-1-5-lite':
      default:
        return 'grok_imagine_1_5_lite';
    }
  }

  private mapRatioForGen4Turbo(aspectRatio: string): string {
    if (aspectRatio === '9:16') return '720:1280';
    if (aspectRatio === '1:1') return '960:960';
    if (aspectRatio === '4:3') return '1104:832';
    return '1280:720';
  }

  private mapRatioForWan3(aspectRatio: string, resolution: string): string {
    const is480 = resolution === '480p';
    const is1080 = resolution === '1080p';

    if (aspectRatio === 'auto') {
      if (is480) return 'auto_480p';
      if (is1080) return 'auto_1080p';
      return 'auto_720p';
    }

    if (is480) {
      if (aspectRatio === '9:16') return '480:832';
      if (aspectRatio === '1:1') return '624:624';
      if (aspectRatio === '4:3') return '720:544';
      return '832:480';
    }

    if (is1080) {
      if (aspectRatio === '9:16') return '1080:1920';
      if (aspectRatio === '1:1') return '1440:1440';
      if (aspectRatio === '4:3') return '1648:1248';
      return '1920:1080';
    }

    // Default 720p
    if (aspectRatio === '9:16') return '720:1280';
    if (aspectRatio === '1:1') return '960:960';
    if (aspectRatio === '4:3') return '1104:832';
    return '1280:720';
  }

  private mapRatioForGrok(aspectRatio: string, resolution: string): string {
    const is480 = resolution === '480p';
    const is1080 = resolution === '1080p';

    if (is480) {
      if (aspectRatio === '9:16') return '480:848';
      if (aspectRatio === '1:1') return '480:480';
      if (aspectRatio === '4:3') return '640:480';
      return '848:480'; // 16:9 widescreen
    }

    if (is1080) {
      if (aspectRatio === '9:16') return '1072:1904';
      if (aspectRatio === '1:1') return '1424:1424';
      if (aspectRatio === '4:3') return '1648:1232';
      return '1904:1072'; // 16:9 widescreen
    }

    // Default: 720p
    if (aspectRatio === '9:16') return '720:1280';
    if (aspectRatio === '1:1') return '720:720';
    if (aspectRatio === '4:3') return '960:720';
    return '1280:720'; // 16:9 widescreen
  }

  async generateVideo(job: VideoJob, request: GenerateVideoRequest): Promise<ProviderInitiateResult> {
    if (!this.apiKey) {
      throw new Error(
        'Runway API Key is missing. Please set RUNWAY_API_KEY in your environment or Settings modal.'
      );
    }

    const providerModel = this.getProviderModel(request.modelId);
    const isGen4Turbo = providerModel === 'gen4_turbo';
    const isImageToVideo = Boolean(request.referenceImageUrl) || isGen4Turbo;

    if (isGen4Turbo && !request.referenceImageUrl) {
      throw new Error(
        "Gen-4 Turbo is Runway's fastest Image to Video model and requires a starter image (first frame). Please paste an image URL or upload an image."
      );
    }

    const promptText = request.enhancedPrompt || request.prompt;
    const endpoint = isImageToVideo 
      ? 'https://api.dev.runwayml.com/v1/image_to_video' 
      : 'https://api.dev.runwayml.com/v1/text_to_video';

    const payload: Record<string, any> = {
      model: providerModel,
      duration: request.duration || 5,
    };

    if (promptText) {
      payload.promptText = promptText;
    }

    if (isImageToVideo && request.referenceImageUrl) {
      payload.promptImage = request.referenceImageUrl;
    }

    // Model specific parameter mappings
    if (providerModel === 'h3_max') {
      payload.resolution = request.resolution === '480p' ? '480p' : '768p';
    } else if (providerModel === 'gen4_turbo') {
      payload.ratio = this.mapRatioForGen4Turbo(request.aspectRatio);
    } else if (providerModel === 'wan3_prime') {
      payload.ratio = this.mapRatioForWan3(request.aspectRatio, request.resolution);
    } else {
      payload.ratio = this.mapRatioForGrok(request.aspectRatio, request.resolution);
    }

    if (request.seed) {
      payload.seed = request.seed;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Runway-Version': '2024-11-06',
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
          'X-Runway-Version': '2024-11-06',
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
          costCredits: data.cost?.credits,
        };
      }

      if (data.status === 'FAILED') {
        return {
          status: 'FAILED',
          progress: 0,
          errorMessage: data.failure || data.failureCode || 'Runway generation failed',
        };
      }

      if (data.status === 'CANCELLED') {
        return {
          status: 'CANCELLED',
          progress: 0,
        };
      }

      // RUNNING or PENDING
      const rawProgress = typeof data.progress === 'number' ? data.progress : 0;
      const progressPercent = Math.min(99, Math.max(5, Math.round(rawProgress * 100)));

      return {
        status: 'PROCESSING',
        progress: progressPercent,
      };
    } catch (err: any) {
      console.error('[Runway CheckStatus Error]:', err);
      return {
        status: 'PROCESSING',
        progress: 10,
        errorMessage: err.message,
      };
    }
  }

  async cancel(providerJobId: string): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${providerJobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Runway-Version': '2024-11-06',
        },
      });
      return response.ok;
    } catch (err) {
      console.error('[Runway Cancel Error]:', err);
      return false;
    }
  }
}

export const runwayVideoProvider = new RunwayVideoProvider();
