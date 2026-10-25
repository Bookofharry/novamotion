import { Router } from 'express';
import { compositionService } from '../services/composition.service.js';
import { audioService } from '../services/audio.service.js';

export const compositionRouter = Router();

/**
 * Get available ambient audio soundscapes and musical themes
 */
compositionRouter.get('/audio-tracks', (req, res) => {
  try {
    const tracks = audioService.getAvailableTracks();
    res.json({
      success: true,
      data: tracks,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to fetch audio tracks',
    });
  }
});

/**
 * Concat / Stitch multiple video clips into a single video
 */
compositionRouter.post('/merge', async (req, res) => {
  try {
    const { videoUrls, outputName, transition } = req.body;
    if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length < 2) {
      res.status(400).json({
        success: false,
        error: 'Please provide at least 2 video URLs to stitch together.',
      });
      return;
    }

    const result = await compositionService.mergeClips({ videoUrls, outputName, transition });
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[Composition Error]:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to merge video clips',
    });
  }
});

/**
 * Trim a video clip
 */
compositionRouter.post('/trim', async (req, res) => {
  try {
    const { videoUrl, startSec, durationSec } = req.body;
    if (!videoUrl || typeof startSec !== 'number' || typeof durationSec !== 'number') {
      res.status(400).json({
        success: false,
        error: 'videoUrl, startSec, and durationSec are required.',
      });
      return;
    }

    const result = await compositionService.trimClip({ videoUrl, startSec, durationSec });
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[Trim Error]:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to trim video clip',
    });
  }
});

/**
 * Attach audio track / background soundscape to video
 */
compositionRouter.post('/add-audio', async (req, res) => {
  try {
    const { videoUrl, audioTrackId, audioUrl, volume, loopAudio } = req.body;
    if (!videoUrl || (!audioTrackId && !audioUrl)) {
      res.status(400).json({
        success: false,
        error: 'videoUrl and either audioTrackId or audioUrl are required.',
      });
      return;
    }

    const result = await compositionService.addAudioTrack({
      videoUrl,
      audioTrackId,
      audioUrl,
      volume,
      loopAudio,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[Add Audio Error]:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to attach audio soundtrack',
    });
  }
});
