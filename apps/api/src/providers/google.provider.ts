import { GenerateVideoRequest, VideoJob } from '@videolab/shared';
import { IVideoProvider, ProviderInitiateResult, ProviderStatusResult } from './provider.interface.js';
import { CONFIG } from '../config.js';

export class GoogleVeoVideoProvider implements IVideoProvider {
  readonly providerId = 'google';
  private apiKey: string;

  constructor() {
    this.apiKey = CONFIG.GOOGLE_AI_API_KEY;
  }

  async generateVideo(job: VideoJob, request: GenerateVideoRequest): Promise<ProviderInitiateResult> {
    if (!this.apiKey) {
      throw new Error('Google AI API Key is not configured. Set GOOGLE_AI_API_KEY in .env or switch to the VideoLab Ultra-Fast (Dev Mock) model.');
    }

    const providerJobId = `google-veo-${Date.now()}`;
    return {
      providerJobId,
      initialStatus: 'PROCESSING',
    };
  }

  async checkStatus(providerJobId: string): Promise<ProviderStatusResult> {
    if (!this.apiKey) {
      return {
        status: 'FAILED',
        progress: 0,
        errorMessage: 'Google AI API Key is missing',
      };
    }

    return {
      status: 'PROCESSING',
      progress: 60,
    };
  }

  async cancel(providerJobId: string): Promise<boolean> {
    return true;
  }
}
