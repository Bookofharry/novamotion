import { Router } from 'express';
import { GenerateVideoRequest } from '@videolab/shared';
import { AVAILABLE_MODELS } from '../config.js';
import { jobService } from '../services/job.service.js';
import { queueService } from '../services/queue.service.js';

export const generationRouter = Router();

// POST /api/v1/generate - Submit video generation job
generationRouter.post('/', async (req, res) => {
  try {
    const request = req.body as GenerateVideoRequest;

    if (!request.prompt || !request.prompt.trim()) {
      res.status(400).json({ success: false, error: 'Prompt is required' });
      return;
    }

    const model = AVAILABLE_MODELS.find(m => m.id === request.modelId) || AVAILABLE_MODELS.find(m => m.isDefault)!;

    const job = await jobService.createJob(request, model);
    await queueService.enqueue(job, request);

    res.status(202).json({
      success: true,
      data: job,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to submit generation job' });
  }
});

// GET /api/v1/jobs - List all generation jobs
generationRouter.get('/jobs', (req, res) => {
  const jobs = jobService.getAllJobs();
  res.json({
    success: true,
    data: jobs,
  });
});

// GET /api/v1/jobs/:id - Get specific job status
generationRouter.get('/jobs/:id', (req, res) => {
  const job = jobService.getJob(req.params.id);
  if (!job) {
    res.status(404).json({ success: false, error: 'Job not found' });
    return;
  }
  res.json({
    success: true,
    data: job,
  });
});

// POST /api/v1/jobs/:id/cancel - Cancel active generation job
generationRouter.post('/jobs/:id/cancel', async (req, res) => {
  const success = await queueService.cancelJob(req.params.id);
  if (!success) {
    res.status(404).json({ success: false, error: 'Job not found or already completed' });
    return;
  }
  res.json({
    success: true,
    message: 'Job cancelled successfully',
  });
});
