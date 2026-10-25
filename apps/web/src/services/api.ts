import { 
  GenerateVideoRequest, 
  VideoJob, 
  VideoModelInfo, 
  EnhancePromptRequest, 
  EnhancePromptResponse,
  Project,
  UserCredits,
  TransitionType,
  CompositionResult,
  AudioTrackInfo,
  AddAudioRequest
} from '@videolab/shared';

const BASE_URL = '/api/v1';

export async function fetchModels(): Promise<VideoModelInfo[]> {
  const res = await fetch(`${BASE_URL}/models`);
  const data = await res.json();
  return data.data;
}

export async function submitGeneration(params: GenerateVideoRequest): Promise<VideoJob> {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit generation');
  return data.data;
}

export async function fetchJobs(): Promise<VideoJob[]> {
  const res = await fetch(`${BASE_URL}/jobs`);
  const data = await res.json();
  return data.data || [];
}

export async function fetchJob(id: string): Promise<VideoJob> {
  const res = await fetch(`${BASE_URL}/jobs/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Job not found');
  return data.data;
}

export async function cancelJob(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/jobs/${id}/cancel`, {
    method: 'POST',
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to cancel job');
  }
}

export async function enhancePrompt(params: EnhancePromptRequest): Promise<EnhancePromptResponse> {
  const res = await fetch(`${BASE_URL}/prompt/enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to enhance prompt');
  return data.data;
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${BASE_URL}/projects`);
  const data = await res.json();
  return data.data || [];
}

export async function fetchCredits(): Promise<UserCredits> {
  const res = await fetch(`${BASE_URL}/credits`);
  const data = await res.json();
  return data.data;
}

export async function uploadReferenceImage(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload image');
  return data.data;
}

export interface ProviderKeysStatus {
  hasRunwayKey: boolean;
  runwayKeyMasked: string;
  hasGoogleKey: boolean;
  googleKeyMasked: string;
}

export async function fetchProviderKeys(): Promise<ProviderKeysStatus> {
  const res = await fetch(`${BASE_URL}/settings/keys`);
  const data = await res.json();
  return data.data;
}

export async function updateProviderKeys(keys: { runwayKey?: string; googleKey?: string }): Promise<void> {
  const res = await fetch(`${BASE_URL}/settings/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keys),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update keys');
  }
}

export async function mergeClips(videoUrls: string[], transition: TransitionType = 'cut'): Promise<CompositionResult> {
  const res = await fetch(`${BASE_URL}/composition/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrls, transition }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to merge video clips');
  return data.data;
}

export async function trimClip(videoUrl: string, startSec: number, durationSec: number): Promise<CompositionResult> {
  const res = await fetch(`${BASE_URL}/composition/trim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrl, startSec, durationSec }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to trim video clip');
  return data.data;
}

export async function fetchAudioTracks(): Promise<AudioTrackInfo[]> {
  const res = await fetch(`${BASE_URL}/composition/audio-tracks`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load audio tracks');
  return data.data || [];
}

export async function addAudioToVideo(params: AddAudioRequest): Promise<CompositionResult> {
  const res = await fetch(`${BASE_URL}/composition/add-audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to attach audio soundtrack');
  return data.data;
}
