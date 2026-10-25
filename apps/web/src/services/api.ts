import { 
  GenerateVideoRequest, 
  VideoJob, 
  VideoModelInfo, 
  EnhancePromptRequest, 
  EnhancePromptResponse,
  Project,
  UserCredits 
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

