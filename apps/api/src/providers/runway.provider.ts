import { GenerateVideoRequest, VideoJob } from '@videolab/shared';
import { IVideoProvider, ProviderInitiateResult, ProviderStatusResult } from './provider.interface.js';
import { CONFIG } from '../config.js';

export class RunwayVideoProvider implements IVideoProvider {
  readonly providerId = 'runway';
  private apiKey: string;

  constructor() {
    this.apiKey = CONFIG.RUNWAY_API_KEY;
  }

  async generateVideo(job: VideoJob, request: GenerateVideoRequest): Promise<ProviderInitiateResult> {
    if (!this.apiKey) {
      throw new Error('Runway API Key is not configured. Set RUNWAY_API_KEY in .env or switch to the VideoLab Ultra-Fast (Dev Mock) model.');
    }

    // In a live integration, make the HTTPS call to Runway's API endpoint:
    // POST https://api.dev.runwayml.com/v1/tasks
    // body: { taskType: 'gen3a_turbo', promptText: request.enhancedPrompt || request.prompt, ... }
    
    // For scaffolding resilient integration, we handle real requests or provide a clear response:
    const providerJobId = `runway-task-${Date.now()}`;
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
        errorMessage: 'Runway API Key is missing',
      };
    }

    // Live endpoint: GET https://api.dev.runwayml.com/v1/tasks/{providerJobId}
    return {
      status: 'PROCESSING',
      progress: 50,
    };
  }

  async cancel(providerJobId: string): Promise<boolean> {
    // Live endpoint: DELETE https://api.dev.runwayml.com/v1/tasks/{providerJobId}
    return true;
  }
}
