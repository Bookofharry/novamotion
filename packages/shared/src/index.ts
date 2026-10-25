export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
export type VideoResolution = '720p' | '1080p' | '4k';
export type VideoDuration = 5 | 10;

export type ProviderType = 'google' | 'runway' | 'mock' | 'luma';

export type JobStatus = 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface VideoModelInfo {
  id: string;
  name: string;
  provider: ProviderType;
  description: string;
  supportsTextToVideo: boolean;
  supportsImageToVideo: boolean;
  supportedAspectRatios: AspectRatio[];
  supportedResolutions: VideoResolution[];
  supportedDurations: VideoDuration[];
  costPerSecond: number; // in platform credits
  isDefault?: boolean;
}

export interface GenerateVideoRequest {
  prompt: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  referenceImageUrl?: string;
  modelId: string;
  aspectRatio: AspectRatio;
  duration: VideoDuration;
  resolution: VideoResolution;
  motionStrength?: number; // 1-10
  seed?: number;
  projectId?: string;
}

export interface VideoJob {
  id: string;
  prompt: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  referenceImageUrl?: string;
  modelId: string;
  provider: ProviderType;
  providerJobId?: string;
  status: JobStatus;
  progress: number; // 0 - 100
  aspectRatio: AspectRatio;
  duration: VideoDuration;
  resolution: VideoResolution;
  resultVideoUrl?: string;
  thumbnailUrl?: string;
  creditsUsed: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface EnhancePromptRequest {
  prompt: string;
  stylePreset?: 'cinematic' | 'anime' | 'photorealistic' | '3d-render' | 'cyberpunk' | 'fantasy';
  cameraMovement?: 'pan-left' | 'pan-right' | 'zoom-in' | 'zoom-out' | 'drone-shot' | 'orbital';
}

export interface EnhancePromptResponse {
  originalPrompt: string;
  enhancedPrompt: string;
  cameraMovement: string;
  lightingDetails: string;
  suggestedNegativePrompt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  videoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserCredits {
  total: number;
  used: number;
  available: number;
}

export type TransitionType = 'cut' | 'crossfade' | 'fade-to-black';

export interface MergeClipsRequest {
  videoUrls: string[];
  outputName?: string;
  transition?: TransitionType;
}

export interface TrimClipRequest {
  videoUrl: string;
  startSec: number;
  durationSec: number;
}

export interface CompositionResult {
  outputVideoUrl: string;
  durationSec?: number;
  fileSizeBytes?: number;
}

export interface AudioTrackInfo {
  id: string;
  title: string;
  category: 'cinematic' | 'cyberpunk' | 'ambient' | 'action' | 'lofi' | 'scifi';
  mood: string;
  durationSec: number;
  audioUrl: string;
}

export interface AddAudioRequest {
  videoUrl: string;
  audioTrackId?: string;
  audioUrl?: string;
  volume?: number; // 0.0 to 1.0
  loopAudio?: boolean;
}
