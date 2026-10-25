import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { 
  MergeClipsRequest, 
  TrimClipRequest, 
  CompositionResult, 
  AddAudioRequest 
} from '@videolab/shared';
import { audioService } from './audio.service.js';

export class CompositionService {
  private uploadsDir = path.resolve(process.cwd(), 'uploads');
  private rendersDir = path.resolve(process.cwd(), 'uploads', 'renders');
  private hasFfmpeg: boolean | null = null;

  constructor() {
    if (!fs.existsSync(this.rendersDir)) {
      fs.mkdirSync(this.rendersDir, { recursive: true });
    }
  }

  /**
   * Checks if FFmpeg is available on the host machine or container.
   */
  private async checkFfmpegAvailable(): Promise<boolean> {
    if (this.hasFfmpeg !== null) return this.hasFfmpeg;
    return new Promise((resolve) => {
      const proc = spawn('ffmpeg', ['-version']);
      proc.on('close', (code) => {
        this.hasFfmpeg = code === 0;
        resolve(this.hasFfmpeg);
      });
      proc.on('error', () => {
        this.hasFfmpeg = false;
        resolve(false);
      });
    });
  }

  /**
   * Resolves a public URL or local path to a local absolute filepath or downloads it if remote.
   */
  private async resolveVideoFile(inputUrl: string): Promise<string> {
    // If it's a local /uploads/... URL
    if (inputUrl.startsWith('/uploads/')) {
      const filename = inputUrl.replace('/uploads/', '');
      const localPath = path.resolve(this.uploadsDir, filename);
      if (fs.existsSync(localPath)) return localPath;
    }

    // Direct path
    if (fs.existsSync(inputUrl)) return inputUrl;

    // If it's an HTTP/HTTPS remote URL, download to scratch cache
    if (inputUrl.startsWith('http://') || inputUrl.startsWith('https://')) {
      const ext = path.extname(new URL(inputUrl).pathname) || '.mp4';
      const destPath = path.resolve(this.rendersDir, `cache-${Date.now()}-${uuidv4().substring(0, 6)}${ext}`);
      
      const res = await fetch(inputUrl);
      if (!res.ok) throw new Error(`Failed to download remote clip: ${inputUrl}`);
      const arrayBuffer = await res.arrayBuffer();
      await fs.promises.writeFile(destPath, Buffer.from(arrayBuffer));
      return destPath;
    }

    throw new Error(`Video file not found or invalid: ${inputUrl}`);
  }

  /**
   * Concat and stitch multiple clips using FFmpeg concat demuxer or transition filter
   */
  async mergeClips(request: MergeClipsRequest): Promise<CompositionResult> {
    if (!request.videoUrls || request.videoUrls.length < 2) {
      throw new Error('At least 2 video clips are required to perform stitching.');
    }

    const localFiles = await Promise.all(
      request.videoUrls.map(url => this.resolveVideoFile(url))
    );

    const outputId = uuidv4().substring(0, 8);
    const outputFilename = `composite-${Date.now()}-${outputId}.mp4`;
    const outputPath = path.resolve(this.rendersDir, outputFilename);

    const isFfmpegAvailable = await this.checkFfmpegAvailable();

    if (!isFfmpegAvailable) {
      console.warn('[Composition] FFmpeg not found in environment (installed inside Docker container). Using dev-mode fallback.');
      // Copy the first clip as the representative output file for dev mode
      await fs.promises.copyFile(localFiles[0], outputPath);
      const stats = await fs.promises.stat(outputPath);
      return {
        outputVideoUrl: `/uploads/renders/${outputFilename}`,
        fileSizeBytes: stats.size,
      };
    }

    // Create a concat list file for FFmpeg
    const listFilePath = path.resolve(this.rendersDir, `concat-list-${outputId}.txt`);
    const listFileContent = localFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
    await fs.promises.writeFile(listFilePath, listFileContent, 'utf-8');

    try {
      await new Promise<void>((resolve, reject) => {
        const args = [
          '-f', 'concat',
          '-safe', '0',
          '-i', listFilePath,
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '22',
          '-c:a', 'aac',
          '-movflags', '+faststart',
          '-y',
          outputPath
        ];

        console.log(`[FFmpeg] Executing concat: ffmpeg ${args.join(' ')}`);
        const proc = spawn('ffmpeg', args);

        let stderr = '';
        proc.stderr.on('data', (d) => { stderr += d.toString(); });

        proc.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            console.error('[FFmpeg Error output]:', stderr);
            reject(new Error(`FFmpeg concat process exited with code ${code}`));
          }
        });

        proc.on('error', (err) => {
          reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
        });
      });

      const stats = await fs.promises.stat(outputPath);
      return {
        outputVideoUrl: `/uploads/renders/${outputFilename}`,
        fileSizeBytes: stats.size,
      };
    } finally {
      if (fs.existsSync(listFilePath)) {
        await fs.promises.unlink(listFilePath).catch(() => {});
      }
    }
  }

  /**
   * Trim video clip
   */
  async trimClip(request: TrimClipRequest): Promise<CompositionResult> {
    const localFile = await this.resolveVideoFile(request.videoUrl);
    const outputFilename = `trimmed-${Date.now()}-${uuidv4().substring(0, 8)}.mp4`;
    const outputPath = path.resolve(this.rendersDir, outputFilename);

    const isFfmpegAvailable = await this.checkFfmpegAvailable();

    if (!isFfmpegAvailable) {
      console.warn('[Composition] FFmpeg not found. Using dev copy fallback for trimming.');
      await fs.promises.copyFile(localFile, outputPath);
      const stats = await fs.promises.stat(outputPath);
      return {
        outputVideoUrl: `/uploads/renders/${outputFilename}`,
        fileSizeBytes: stats.size,
      };
    }

    await new Promise<void>((resolve, reject) => {
      const args = [
        '-ss', request.startSec.toString(),
        '-i', localFile,
        '-t', request.durationSec.toString(),
        '-c', 'copy',
        '-y',
        outputPath
      ];

      const proc = spawn('ffmpeg', args);
      let stderr = '';
      proc.stderr.on('data', (d) => { stderr += d.toString(); });

      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg trim exited with code ${code}: ${stderr}`));
      });
      proc.on('error', (e) => reject(e));
    });

    const stats = await fs.promises.stat(outputPath);
    return {
      outputVideoUrl: `/uploads/renders/${outputFilename}`,
      fileSizeBytes: stats.size,
    };
  }

  /**
   * Multiplexes audio soundtrack or soundscape onto a video clip
   */
  async addAudioTrack(request: AddAudioRequest): Promise<CompositionResult> {
    const localVideoFile = await this.resolveVideoFile(request.videoUrl);
    
    // Resolve audio track file
    let localAudioFile: string | null = null;
    if (request.audioTrackId) {
      localAudioFile = audioService.getAudioFilePath(request.audioTrackId);
    } else if (request.audioUrl) {
      localAudioFile = audioService.getAudioFilePath(request.audioUrl);
      if (!localAudioFile) {
        // remote or local
        localAudioFile = await this.resolveVideoFile(request.audioUrl);
      }
    }

    if (!localAudioFile) {
      throw new Error('Audio track or URL not found.');
    }

    const volume = typeof request.volume === 'number' ? Math.max(0, Math.min(2, request.volume)) : 0.75;
    const outputFilename = `audio-enhanced-${Date.now()}-${uuidv4().substring(0, 8)}.mp4`;
    const outputPath = path.resolve(this.rendersDir, outputFilename);

    const isFfmpegAvailable = await this.checkFfmpegAvailable();

    if (!isFfmpegAvailable) {
      console.warn('[Composition] FFmpeg not found. Returning dev copy fallback.');
      await fs.promises.copyFile(localVideoFile, outputPath);
      const stats = await fs.promises.stat(outputPath);
      return {
        outputVideoUrl: `/uploads/renders/${outputFilename}`,
        fileSizeBytes: stats.size,
      };
    }

    await new Promise<void>((resolve, reject) => {
      const args = [
        '-i', localVideoFile,
        '-stream_loop', '-1',
        '-i', localAudioFile,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-filter_complex', `[1:a]volume=${volume}[a]`,
        '-map', '0:v:0',
        '-map', '[a]',
        '-shortest',
        '-y',
        outputPath
      ];

      console.log(`[FFmpeg] Muxing audio: ffmpeg ${args.join(' ')}`);
      const proc = spawn('ffmpeg', args);

      let stderr = '';
      proc.stderr.on('data', (d) => { stderr += d.toString(); });

      proc.on('close', (code) => {
        if (code === 0) resolve();
        else {
          console.error('[FFmpeg Audio Error]:', stderr);
          reject(new Error(`FFmpeg audio mux failed with code ${code}`));
        }
      });
      proc.on('error', (e) => reject(e));
    });

    const stats = await fs.promises.stat(outputPath);
    return {
      outputVideoUrl: `/uploads/renders/${outputFilename}`,
      fileSizeBytes: stats.size,
    };
  }
}

export const compositionService = new CompositionService();
