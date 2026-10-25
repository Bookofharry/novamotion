import { GenerateVideoRequest, VideoJob } from '@videolab/shared';
import { IVideoProvider, ProviderInitiateResult, ProviderStatusResult } from './provider.interface.js';
import { CONFIG } from '../config.js';

export class GoogleVeoVideoProvider implements IVideoProvider {
  readonly providerId = 'google';
  private get apiKey(): string {
    return CONFIG.GOOGLE_AI_API_KEY;
  }

  async generateVideo(job: VideoJob, request: GenerateVideoRequest): Promise<ProviderInitiateResult> {
    if (!this.apiKey) {
      throw new Error(
        'Google AI API Key is missing. Please set GOOGLE_AI_API_KEY in your environment or Settings modal, or use the VideoLab Ultra-Fast (Dev Mock) model.'
      );
    }

    const promptText = request.enhancedPrompt || request.prompt;
    const isImageToVideo = Boolean(request.referenceImageUrl);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning?key=${this.apiKey}`;

    const requestPayload: Record<string, any> = {
      prompt: {
        text: promptText,
      },
      aspectRatio: request.aspectRatio,
      durationSeconds: request.duration,
      resolution: request.resolution,
    };

    if (isImageToVideo) {
      requestPayload.referenceImage = {
        uri: request.referenceImageUrl,
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || `Google Veo API error: ${response.statusText}`);
      }

      // Google returns an asynchronous operation resource name (e.g. "operations/veo-...")
      const providerJobId = data.name || `veo-op-${Date.now()}`;

      return {
        providerJobId,
        initialStatus: 'PROCESSING',
      };
    } catch (err: any) {
      console.error('[GoogleVeoProvider Error]:', err);
      throw new Error(`Failed to initiate Google Veo generation: ${err.message}`);
    }
  }

  async checkStatus(providerJobId: string): Promise<ProviderStatusResult> {
    if (!this.apiKey) {
      return {
        status: 'FAILED',
        progress: 0,
        errorMessage: 'Google AI API Key is missing',
      };
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/${providerJobId}?key=${this.apiKey}`;
      const response = await fetch(endpoint);
      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || `Google Veo status error: ${response.statusText}`);
      }

      if (data.done) {
        if (data.error) {
          return {
            status: 'FAILED',
            progress: 0,
            errorMessage: data.error.message || 'Google Veo video generation failed',
          };
        }

        const videoUri = data.response?.generatedVideo?.uri || data.response?.videoUri;
        const thumbnailUri = data.response?.generatedVideo?.thumbnailUri || videoUri;

        return {
          status: 'COMPLETED',
          progress: 100,
          resultVideoUrl: videoUri,
          thumbnailUrl: thumbnailUri,
        };
      }

      const metadataProgress = data.metadata?.progressPercent || 50;

      return {
        status: 'PROCESSING',
        progress: Math.min(99, Math.max(10, Math.floor(metadataProgress))),
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        progress: 0,
        errorMessage: err.message || 'Google Veo status check failed',
      };
    }
  }

  async cancel(providerJobId: string): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/${providerJobId}:cancel?key=${this.apiKey}`;
      const res = await fetch(endpoint, { method: 'POST' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}
