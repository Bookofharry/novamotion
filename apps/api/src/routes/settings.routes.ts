import { Router } from 'express';
import { CONFIG } from '../config.js';

export const settingsRouter = Router();

settingsRouter.get('/keys', (req, res) => {
  res.json({
    success: true,
    data: {
      hasRunwayKey: Boolean(CONFIG.RUNWAY_API_KEY && CONFIG.RUNWAY_API_KEY.trim()),
      runwayKeyMasked: CONFIG.RUNWAY_API_KEY ? `••••••••${CONFIG.RUNWAY_API_KEY.slice(-4)}` : '',
      hasGoogleKey: Boolean(CONFIG.GOOGLE_AI_API_KEY && CONFIG.GOOGLE_AI_API_KEY.trim()),
      googleKeyMasked: CONFIG.GOOGLE_AI_API_KEY ? `••••••••${CONFIG.GOOGLE_AI_API_KEY.slice(-4)}` : '',
    },
  });
});

settingsRouter.post('/keys', (req, res) => {
  const { runwayKey, googleKey } = req.body;

  if (typeof runwayKey === 'string') {
    CONFIG.RUNWAY_API_KEY = runwayKey.trim();
  }

  if (typeof googleKey === 'string') {
    CONFIG.GOOGLE_AI_API_KEY = googleKey.trim();
  }

  res.json({
    success: true,
    message: 'Provider API keys updated successfully',
    data: {
      hasRunwayKey: Boolean(CONFIG.RUNWAY_API_KEY),
      hasGoogleKey: Boolean(CONFIG.GOOGLE_AI_API_KEY),
    },
  });
});
