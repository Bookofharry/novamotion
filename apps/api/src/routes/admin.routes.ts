import { Router } from 'express';
import { adminService } from '../services/admin.service.js';
import { jobService } from '../services/job.service.js';

export const adminRouter = Router();

// Get complete platform audit & financials
adminRouter.get('/audit', (req, res) => {
  try {
    const summary = adminService.getAuditSummary();
    res.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate audit report',
    });
  }
});

// Adjust user credits (bonus, refund, top-up)
adminRouter.post('/credits/adjust', (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number') {
      return res.status(400).json({ success: false, error: 'amount must be a number' });
    }
    const currentAdjusted = adminService.adjustCredits(amount);
    res.json({
      success: true,
      message: `Adjusted credits by ${amount > 0 ? '+' : ''}${amount}`,
      data: {
        amount,
        currentAdjusted,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Configure platform markup multiplier
adminRouter.post('/markup', (req, res) => {
  try {
    const { multiplier } = req.body;
    if (typeof multiplier !== 'number' || multiplier < 1.0) {
      return res.status(400).json({ success: false, error: 'multiplier must be a number >= 1.0' });
    }
    const updated = adminService.setMarkupMultiplier(multiplier);
    res.json({
      success: true,
      message: `Updated platform markup multiplier to ${updated}x`,
      data: { markupMultiplier: updated },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Configure base platform processing fee
adminRouter.post('/base-fee', (req, res) => {
  try {
    const { fee } = req.body;
    if (typeof fee !== 'number' || fee < 0) {
      return res.status(400).json({ success: false, error: 'fee must be a positive number' });
    }
    const updated = adminService.setBasePlatformFee(fee);
    res.json({
      success: true,
      message: `Updated base platform processing fee to ${updated} credits`,
      data: { basePlatformFeeCredits: updated },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List retail credit packages
adminRouter.get('/packages', (req, res) => {
  import('../services/admin.service.js').then(({ CREDIT_PACKAGES }) => {
    res.json({
      success: true,
      data: CREDIT_PACKAGES,
    });
  });
});

// Purchase / top-up credit package
adminRouter.post('/packages/purchase', (req, res) => {
  try {
    const { packageId } = req.body;
    const result = adminService.purchasePackage(packageId);
    res.json({
      success: true,
      message: `Successfully purchased ${result.pkg.name} (+${result.pkg.credits} credits)!`,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Manually sync/re-poll a job from Runway to get exact cost & output
adminRouter.post('/jobs/:id/sync', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedJob = await adminService.syncJobWithRunway(id);
    res.json({
      success: true,
      message: 'Job synced successfully with Runway Dev API',
      data: updatedJob,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a job from audit history
adminRouter.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await jobService.deleteJob(id);
    res.json({
      success: ok,
      message: ok ? 'Job deleted successfully' : 'Failed to delete job',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Live ping & status test for Runway API
adminRouter.get('/runway-status', async (req, res) => {
  try {
    const status = await adminService.testRunwayConnection();
    res.json({
      success: true,
      data: status,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
