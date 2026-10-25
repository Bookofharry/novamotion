import fs from 'fs';
import path from 'path';
import { AudioTrackInfo } from '@videolab/shared';

export class AudioService {
  private audioDir = path.resolve(process.cwd(), 'uploads', 'audio');
  private tracks: AudioTrackInfo[] = [
    {
      id: 'cinematic-drone',
      title: 'Ethereal Cinematic Drone',
      category: 'cinematic',
      mood: 'Atmospheric, Suspenseful, Wonder',
      durationSec: 15,
      audioUrl: '/uploads/audio/cinematic-drone.wav',
    },
    {
      id: 'cyberpunk-pulse',
      title: 'Neon Cyberpunk Pulse',
      category: 'cyberpunk',
      mood: 'Dystopian, High-tech, Energetic',
      durationSec: 15,
      audioUrl: '/uploads/audio/cyberpunk-pulse.wav',
    },
    {
      id: 'deep-ocean',
      title: 'Deep Ocean & Rain Ambience',
      category: 'ambient',
      mood: 'Organic, Calming, Submerged',
      durationSec: 15,
      audioUrl: '/uploads/audio/deep-ocean.wav',
    },
    {
      id: 'action-trailer',
      title: 'Epic Trailer Impact & Rise',
      category: 'action',
      mood: 'Intense, Dramatic, Cinematic Boom',
      durationSec: 15,
      audioUrl: '/uploads/audio/action-trailer.wav',
    },
    {
      id: 'lofi-chill',
      title: 'Midnight Sunset Lo-Fi',
      category: 'lofi',
      mood: 'Mellow, Warm Rhodes, Relaxed',
      durationSec: 15,
      audioUrl: '/uploads/audio/lofi-chill.wav',
    },
    {
      id: 'scifi-voyage',
      title: 'Deep Space Orbital Frequencies',
      category: 'scifi',
      mood: 'Ethereal, Cosmic, Binaural Harmony',
      durationSec: 15,
      audioUrl: '/uploads/audio/scifi-voyage.wav',
    },
  ];

  constructor() {
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
    this.ensureAudioFiles();
  }

  getAvailableTracks(): AudioTrackInfo[] {
    return this.tracks;
  }

  getTrackById(id: string): AudioTrackInfo | undefined {
    return this.tracks.find(t => t.id === id);
  }

  public getAudioFilePath(idOrUrl: string): string | null {
    const track = this.tracks.find(t => t.id === idOrUrl || t.audioUrl === idOrUrl);
    if (track) {
      const filename = path.basename(track.audioUrl);
      const filePath = path.resolve(this.audioDir, filename);
      if (fs.existsSync(filePath)) return filePath;
    }

    if (idOrUrl.startsWith('/uploads/audio/')) {
      const filename = idOrUrl.replace('/uploads/audio/', '');
      const filePath = path.resolve(this.audioDir, filename);
      if (fs.existsSync(filePath)) return filePath;
    }

    return null;
  }

  /**
   * Generates synthetic ambient soundscape WAV files if not already generated.
   */
  private ensureAudioFiles(): void {
    try {
      for (const track of this.tracks) {
        const filename = `${track.id}.wav`;
        const filePath = path.resolve(this.audioDir, filename);
        if (!fs.existsSync(filePath)) {
          console.log(`[AudioService] Generating synthetic soundscape: ${filename}...`);
          const buffer = this.generateSyntheticWav(track.id, track.durationSec);
          fs.writeFileSync(filePath, buffer);
        }
      }
    } catch (err: any) {
      console.warn('[AudioService] Failed to synthesize default audio files:', err.message);
    }
  }

  /**
   * Generates a 44.1 kHz, 16-bit stereo WAV buffer with procedural ambient soundscapes.
   */
  private generateSyntheticWav(trackId: string, durationSec: number): Buffer {
    const sampleRate = 44100;
    const numChannels = 2;
    const numSamples = sampleRate * durationSec;
    const bytesPerSample = 2; // 16-bit
    const dataSize = numSamples * numChannels * bytesPerSample;
    const headerSize = 44;
    const buffer = Buffer.alloc(headerSize + dataSize);

    // --- RIFF Header ---
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // --- FMT Subchunk ---
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // ByteRate
    buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // BlockAlign
    buffer.writeUInt16LE(16, 34); // BitsPerSample

    // --- DATA Subchunk ---
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // --- Procedural Waveform Synthesis ---
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let left = 0;
      let right = 0;

      // Master fade in (1.5s) and fade out (1.5s)
      let env = 1.0;
      if (t < 1.5) env = t / 1.5;
      else if (t > durationSec - 1.5) env = (durationSec - t) / 1.5;

      switch (trackId) {
        case 'cyberpunk-pulse': {
          // 120 BPM tempo = 2 beats per second. Kick & bass pulse every 0.5s
          const beatTime = t % 0.5;
          const bassDecay = Math.exp(-beatTime * 8);
          const bass = Math.sin(2 * Math.PI * 55 * t) * 0.5 * bassDecay;
          // Arpeggiator note frequencies (D minor: D3, F3, A3, C4)
          const arpNotes = [146.83, 174.61, 220.0, 261.63];
          const arpIndex = Math.floor(t * 4) % 4;
          const arpFreq = arpNotes[arpIndex];
          const arp = Math.sin(2 * Math.PI * arpFreq * t) * 0.25;
          // Hi-hat noise burst on sixteenths
          const hihatTime = t % 0.25;
          const hihat = (Math.random() * 2 - 1) * Math.exp(-hihatTime * 30) * 0.1;
          left = (bass + arp * 0.8 + hihat) * env;
          right = (bass + arp * 0.6 + hihat * 0.8) * env;
          break;
        }

        case 'cinematic-drone': {
          // Deep atmospheric warm chord (C2, G2, C3, E3) with slow 0.15Hz chorus sweep
          const lfo = Math.sin(2 * Math.PI * 0.15 * t);
          const o1 = Math.sin(2 * Math.PI * 65.41 * t);
          const o2 = Math.sin(2 * Math.PI * (98.0 + lfo * 0.5) * t);
          const o3 = Math.sin(2 * Math.PI * (130.81 - lfo * 0.5) * t);
          const o4 = Math.sin(2 * Math.PI * 164.81 * t);
          const shimmer = Math.sin(2 * Math.PI * 523.25 * t) * (0.05 + lfo * 0.03);
          const mix = (o1 * 0.4 + o2 * 0.3 + o3 * 0.2 + o4 * 0.15 + shimmer) * 0.6;
          left = (mix * (1.0 + lfo * 0.2)) * env;
          right = (mix * (1.0 - lfo * 0.2)) * env;
          break;
        }

        case 'deep-ocean': {
          // Ocean swell with modulated noise
          const wavePeriod = 4.0;
          const wavePhase = (t % wavePeriod) / wavePeriod;
          const swell = Math.sin(Math.PI * wavePhase);
          const noise = (Math.random() * 2 - 1) * swell * 0.25;
          const subRumble = Math.sin(2 * Math.PI * 40 * t) * 0.2 * swell;
          left = (noise * 0.8 + subRumble) * env;
          right = (noise * 0.9 + subRumble) * env;
          break;
        }

        case 'action-trailer': {
          // Impact boom every 3 seconds with metallic riser
          const impactTime = t % 3.0;
          const boomDecay = Math.exp(-impactTime * 3.5);
          const boom = Math.sin(2 * Math.PI * (80 - impactTime * 15) * t) * 0.6 * boomDecay;
          const riserFreq = 100 + Math.pow((t % 3.0) / 3.0, 2) * 500;
          const riser = Math.sin(2 * Math.PI * riserFreq * t) * 0.15 * ((t % 3.0) / 3.0);
          left = (boom + riser) * env;
          right = (boom * 0.9 + riser * 1.1) * env;
          break;
        }

        case 'lofi-chill': {
          // Warm mellow Rhodes chords with gentle vibrato and soft vinyl crackle
          const vibrato = Math.sin(2 * Math.PI * 5 * t) * 1.5;
          const chord = [220, 261.63, 329.63, 392.0]; // Am7
          let rhodes = 0;
          for (let c = 0; c < chord.length; c++) {
            rhodes += Math.sin(2 * Math.PI * (chord[c] + vibrato) * t) * (0.2 / (c + 1));
          }
          const vinyl = Math.random() < 0.015 ? (Math.random() * 2 - 1) * 0.15 : 0;
          left = (rhodes * 0.5 + vinyl) * env;
          right = (rhodes * 0.5 + vinyl * 0.8) * env;
          break;
        }

        case 'scifi-voyage':
        default: {
          // Harmonic space meditation with binaural beat (108 Hz left, 114 Hz right = 6Hz theta)
          const bLeft = Math.sin(2 * Math.PI * 108 * t) * 0.35;
          const bRight = Math.sin(2 * Math.PI * 114 * t) * 0.35;
          const highPad = Math.sin(2 * Math.PI * 432 * t) * 0.1;
          left = (bLeft + highPad) * env;
          right = (bRight + highPad) * env;
          break;
        }
      }

      // Clamp between -1.0 and 1.0, scale to 16-bit signed integer [-32768, 32767]
      const clampL = Math.max(-1, Math.min(1, left));
      const clampR = Math.max(-1, Math.min(1, right));
      buffer.writeInt16LE(Math.round(clampL * 32760), offset);
      buffer.writeInt16LE(Math.round(clampR * 32760), offset + 2);
      offset += 4;
    }

    return buffer;
  }
}

export const audioService = new AudioService();
