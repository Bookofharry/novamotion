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
    id: 'grok-imagine-1-5-lite',
    name: 'Grok Imagine Video 1.5 Lite',
    provider: 'runway',
    description: 'Very fast, low-cost text- and image-to-video distilled from Grok Imagine Video 1.5. (2 credits/s @ 480p, 3 @ 720p, 14 @ 1080p. Start frame adds 1 credit).',
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'],
    supportedResolutions: ['480p', '720p', '1080p'],
    supportedDurations: [5, 10, 15],
    costPerSecond: 3,
    isDefault: true,
  },
];
