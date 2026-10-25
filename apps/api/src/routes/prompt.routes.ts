import { Router } from 'express';
import { EnhancePromptRequest } from '@videolab/shared';
import { promptEnhancerService } from '../services/prompt.service.js';

export const promptRouter = Router();

// POST /api/v1/prompt/enhance
promptRouter.post('/enhance', (req, res) => {
  const { prompt, stylePreset, cameraMovement } = req.body as EnhancePromptRequest;

  if (!prompt || !prompt.trim()) {
    res.status(400).json({ success: false, error: 'Prompt is required' });
    return;
  }

  const result = promptEnhancerService.enhance({
    prompt,
    stylePreset,
    cameraMovement,
  });

  res.json({
    success: true,
    data: result,
  });
});
