import { GenerateVideoRequest, JobStatus, VideoJob } from '@videolab/shared';

export interface ProviderInitiateResult {
  providerJobId: string;
  initialStatus: JobStatus;
}

export interface ProviderStatusResult {
  status: JobStatus;
  progress: number;
  resultVideoUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
  costCredits?: number;
}

export interface IVideoProvider {
  readonly providerId: string;
  generateVideo(job: VideoJob, request: GenerateVideoRequest): Promise<ProviderInitiateResult>;
  checkStatus(providerJobId: string): Promise<ProviderStatusResult>;
  cancel(providerJobId: string): Promise<boolean>;
}
