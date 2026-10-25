import dotenv from 'dotenv';
import { VideoModelInfo } from '@videolab/shared';

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  RUNWAY_API_KEY: process.env.RUNWAY_API_KEY || '',
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || '',
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
    costPerSecond: 1,
    isDefault: true,
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
  {
    id: 'runway-gen3-alpha',
    name: 'Runway Gen-3 Alpha',
    provider: 'runway',
    description: 'Industry-standard motion expressiveness, fine-grained camera direction, and style versatility.',
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportedAspectRatios: ['16:9', '9:16'],
    supportedResolutions: ['720p', '1080p'],
    supportedDurations: [5, 10],
    costPerSecond: 5,
  },
  {
    id: 'runway-gen2',
    name: 'Runway Gen-2',
    provider: 'runway',
    description: 'Reliable, cost-effective baseline generation for rapid animation concepting.',
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportedResolutions: ['720p'],
    supportedDurations: [5],
    costPerSecond: 2,
  },
];
