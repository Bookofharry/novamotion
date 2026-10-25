import { Router } from 'express';
import { AVAILABLE_MODELS } from '../config.js';

export const modelsRouter = Router();

modelsRouter.get('/', (req, res) => {
  res.json({
    success: true,
    data: AVAILABLE_MODELS,
  });
});
