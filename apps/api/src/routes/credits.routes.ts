import { Router } from 'express';
import { UserCredits } from '@videolab/shared';
import { jobService } from '../services/job.service.js';

export const creditsRouter = Router();

creditsRouter.get('/', (req, res) => {
  const jobs = jobService.getAllJobs();
  const usedCredits = jobs.reduce((sum, j) => sum + (j.creditsUsed || 0), 0);
  const totalCredits = 250; // Starter credit allocation

  const credits: UserCredits = {
    total: totalCredits,
    used: usedCredits,
    available: Math.max(0, totalCredits - usedCredits),
  };

  res.json({
    success: true,
    data: credits,
  });
});
