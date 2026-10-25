import dotenv from 'dotenv';
import { VideoModelInfo } from '@videolab/shared';

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  RUNWAY_API_KEY: process.env.RUNWAY_API_KEY || process.env.RUNWAYML_API_SECRET || '',
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '',
};

export const AVAILABLE_MODELS: VideoModelInfo[] = [
  {
    id: 'mock-engine-v1',
    name: 'VideoLab Ultra-Fast (Dev Mock)',
    provider: 'mock',
    description: 'Instant zero-cost development model with realistic simulation and curated HD outputs.',
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '21:9'],
    supportedResolutions: ['720p', '1080p'],
    supportedDurations: [5, 10],
    costPerSecond: 0,
    isDefault: true,
  },
  {
    id: 'runway-lite',
    name: 'Runway Budget Lite (2-3 credits/s)',
    provider: 'runway',
    description: 'Lowest-cost high-speed generation (2 credits/sec @ 480p, 3 credits/sec @ 720p).',
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportedAspectRatios: ['16:9', '9:16'],
    supportedResolutions: ['720p'],
    supportedDurations: [5, 10],
    costPerSecond: 2,
  },
  {
    id: 'runway-gen4',
    name: 'Runway Cinema Gen-4.5 (12 credits/s)',
    provider: 'runway',
    description: 'Runway flagship studio model for maximum cinematic realism, dynamic lighting, and detail.',
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportedAspectRatios: ['16:9', '9:16'],
    supportedResolutions: ['720p', '1080p'],
    supportedDurations: [5, 10],
    costPerSecond: 12,
  },
  {
    id: 'google-veo-2',
    name: 'Google Veo 2',
    provider: 'google',
    description: 'High-definition cinematic realism, consistent physics, and photorealistic lighting.',
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportedResolutions: ['720p', '1080p', '4k'],
    supportedDurations: [5, 10],
    costPerSecond: 4,
  },
];
