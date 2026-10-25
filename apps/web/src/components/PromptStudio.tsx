import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Sliders, 
  Image as ImageIcon, 
  Video, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Info,
  Upload,
  X,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { 
  AspectRatio, 
  VideoDuration, 
  VideoResolution, 
  VideoModelInfo, 
  GenerateVideoRequest 
} from '@videolab/shared';
import { enhancePrompt, uploadReferenceImage } from '../services/api.js';

interface PromptStudioProps {
  models: VideoModelInfo[];
  selectedModel: VideoModelInfo | null;
  onSelectModel: (model: VideoModelInfo) => void;
  onSubmit: (request: GenerateVideoRequest) => Promise<void>;
  isSubmitting: boolean;
}

const ASPECT_RATIOS: { ratio: AspectRatio; label: string; iconClass: string }[] = [
  { ratio: '16:9', label: 'Landscape (16:9)', iconClass: 'w-6 h-3.5 border-2' },
  { ratio: '9:16', label: 'Portrait / Reels (9:16)', iconClass: 'w-3.5 h-6 border-2' },
  { ratio: '1:1', label: 'Square (1:1)', iconClass: 'w-5 h-5 border-2' },
  { ratio: '4:3', label: 'Standard (4:3)', iconClass: 'w-5.5 h-4 border-2' },
];

const PRESET_PROMPTS = [
  'A majestic white dove soaring peacefully across a radiant sunrise sky above calm sapphire waters',
  'A neon-lit cyberpunk samurai standing under rain in futuristic Neo-Tokyo alleyway',
  'Underwater bioluminescent jellyfish dance in crystal clear deep ocean waters',
  'Vintage matte black sports car accelerating along coastal cliff highway at golden hour',
];

export const PromptStudio: React.FC<PromptStudioProps> = ({
  models,
  selectedModel,
  onSelectModel: _onSelectModel,
  onSubmit,
  isSubmitting,
}) => {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<VideoDuration>(5);
  const [resolution, setResolution] = useState<VideoResolution>('720p');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'cinematic' | 'cyberpunk' | 'photorealistic' | 'anime' | '3d-render'>('cinematic');
  const [selectedCamera, setSelectedCamera] = useState<'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'drone-shot' | 'orbital'>('zoom-in');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await enhancePrompt({
        prompt,
        stylePreset: selectedStyle,
        cameraMovement: selectedCamera,
      });
      setEnhancedPrompt(res.enhancedPrompt);
      if (!negativePrompt) {
        setNegativePrompt(res.suggestedNegativePrompt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await uploadReferenceImage(file);
      setReferenceImageUrl(res.url);
    } catch (err: any) {
      alert(`Image upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setIsUploadingImage(true);
    try {
      const res = await uploadReferenceImage(file);
      setReferenceImageUrl(res.url);
    } catch (err: any) {
      alert(`Image upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setEnhancedPrompt('');
    setNegativePrompt('');
    setReferenceImageUrl('');
    setAspectRatio('16:9');
    setDuration(5);
    setResolution('720p');
    setShowAdvanced(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeModel = selectedModel || models[0];
    if (!prompt.trim() || !activeModel || isSubmitting) return;

    await onSubmit({
      prompt: prompt.trim(),
      enhancedPrompt: enhancedPrompt.trim() || undefined,
      negativePrompt: negativePrompt.trim() || undefined,
      referenceImageUrl: referenceImageUrl.trim() || undefined,
      modelId: activeModel.id,
      aspectRatio,
      duration,
      resolution,
    });
  };

  const getCostPerSecond = (res: VideoResolution) => {
    if (res === '480p') return 2;
    if (res === '720p') return 3;
    if (res === '1080p') return 14;
    return 3;
  };

  const currentCost = (duration * getCostPerSecond(resolution)) + (referenceImageUrl ? 1 : 0);
  const activeModel = selectedModel || models[0];

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleGenerate} className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
        
        {/* Generative Model Provider Card */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Generative Model Provider
            </label>
            <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
              xAI Distilled Architecture
            </span>
          </div>

          <div className="rounded-xl p-4 border bg-gradient-to-r from-teal-950/40 via-surface-elevated/70 to-slate-900/60 border-teal-500/40 shadow-lg shadow-teal-950/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-base text-white tracking-wide">
                    {activeModel?.name || 'Grok Imagine Video 1.5 Lite'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Runway / xAI
                  </span>
                  <span className="text-[10px] font-semibold text-teal-300 bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 rounded-full">
                    ★ Selected Engine
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  Very fast, low-cost text- and image-to-video distilled from Grok Imagine Video 1.5.
                </p>
              </div>

              {/* Pricing Rate Matrix */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                <span className={`px-2.5 py-1 rounded-lg border transition-all ${
                  resolution === '480p' 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold' 
                    : 'bg-black/40 border-white/10 text-emerald-300/80'
                }`}>
                  480p: 2 credits/s
                </span>
                <span className={`px-2.5 py-1 rounded-lg border transition-all ${
                  resolution === '720p' 
                    ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-bold' 
                    : 'bg-black/40 border-teal-500/30 text-teal-300/80'
                }`}>
                  720p: 3 credits/s
                </span>
                <span className={`px-2.5 py-1 rounded-lg border transition-all ${
                  resolution === '1080p' 
                    ? 'bg-purple-500/20 border-purple-400 text-purple-200 font-bold' 
                    : 'bg-black/40 border-white/10 text-purple-300/80'
                }`}>
                  1080p: 14 credits/s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image (first frame) Input */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="rounded-xl border border-white/10 bg-surface-elevated/40 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Image (first frame)
              </label>
              <span className="text-[10px] text-teal-400/90 font-mono bg-teal-500/10 px-2 py-0.5 rounded">
                +1 credit
              </span>
            </div>
            {referenceImageUrl && (
              <button
                type="button"
                onClick={() => setReferenceImageUrl('')}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" /> Remove image
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="url"
              value={referenceImageUrl}
              onChange={(e) => setReferenceImageUrl(e.target.value)}
              placeholder="Paste an image URL"
              className="flex-1 w-full bg-surface-elevated text-xs text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2.5 border border-white/10 focus:border-teal-500 outline-none font-mono"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload
              </button>
            </div>
          </div>

          {referenceImageUrl && (
            <div className="flex items-center gap-3 pt-1">
              <img 
                src={referenceImageUrl} 
                alt="First frame" 
                className="w-12 h-12 object-cover rounded-lg border border-teal-500/50 shadow"
              />
              <div className="text-[11px] text-slate-300 truncate font-mono">
                <span className="text-teal-400 font-semibold font-sans">Active First Frame:</span> {referenceImageUrl}
              </div>
            </div>
          )}
        </div>

        {/* Visual Prompt Input & AI Enhancer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Visual Prompt
              </label>
              {referenceImageUrl && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <ImageIcon className="w-3 h-3" /> Image-to-Video Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as any)}
                className="bg-surface-elevated text-xs text-slate-300 rounded-lg px-2.5 py-1 border border-white/10 outline-none focus:border-teal-500"
              >
                <option value="cinematic">Cinematic</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="photorealistic">Photorealistic</option>
                <option value="anime">Anime</option>
                <option value="3d-render">3D Render</option>
              </select>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value as any)}
                className="bg-surface-elevated text-xs text-slate-300 rounded-lg px-2.5 py-1 border border-white/10 outline-none focus:border-teal-500"
              >
                <option value="zoom-in">Zoom In</option>
                <option value="zoom-out">Zoom Out</option>
                <option value="pan-left">Pan Left</option>
                <option value="pan-right">Pan Right</option>
                <option value="drone-shot">Drone Aerial</option>
                <option value="orbital">Orbital 360</option>
              </select>
              <button
                type="button"
                onClick={handleEnhance}
                disabled={!prompt.trim() || isEnhancing}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-medium transition-all disabled:opacity-40"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                {isEnhancing ? 'Enhancing...' : '✨ Enhance Prompt'}
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                referenceImageUrl 
                  ? "Describe motion for this image... (e.g. Dove flutters its wings and takes off into the sky, soft camera tilt up)"
                  : "Describe your scene in detail... (e.g., A beautiful white dove flying gracefully in blue sky, cinematic lighting)"
              }
              className="w-full bg-surface-elevated/80 border border-white/10 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none leading-relaxed"
            />
            <div className="absolute right-3 bottom-3 text-[10px] text-slate-500 font-mono">
              {prompt.length} chars
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
              <Zap className="w-3 h-3 text-amber-400" /> Ideas:
            </span>
            {PRESET_PROMPTS.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(sample)}
                className="text-[11px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 px-2.5 py-0.5 rounded-full transition-colors border border-white/5 truncate max-w-[280px]"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Enhanced Prompt Display */}
          {enhancedPrompt && (
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Enhanced Cinematic Prompt
                </span>
                <button
                  type="button"
                  onClick={() => setEnhancedPrompt('')}
                  className="text-[10px] text-purple-400/70 hover:text-purple-300"
                >
                  Clear
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-black/30 p-2.5 rounded-lg border border-purple-500/10">
                {enhancedPrompt}
              </p>
            </div>
          )}
        </div>

        {/* Video Parameters Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Resolution */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Resolution*
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['480p', '720p', '1080p'] as VideoResolution[]).map((res) => {
                const active = resolution === res;
                const rateLabel = res === '480p' ? '2 c/s' : res === '720p' ? '3 c/s' : '14 c/s';
                return (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      active
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm'
                        : 'bg-surface-elevated/40 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-bold">{res}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{rateLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Duration*
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([5, 10, 15] as VideoDuration[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                    duration === d
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-surface-elevated/40 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="font-bold">{d}s</span>
                  <span className="text-[10px] text-slate-400 font-normal">seconds</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {ASPECT_RATIOS.map((item) => {
                const active = aspectRatio === item.ratio;
                return (
                  <button
                    key={item.ratio}
                    type="button"
                    onClick={() => setAspectRatio(item.ratio)}
                    title={item.label}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      active
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm'
                        : 'bg-surface-elevated/40 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className={`rounded-sm mb-1.5 flex items-center justify-center ${item.iconClass} ${active ? 'border-teal-400' : 'border-slate-500'}`} />
                    <span className="text-[10px] font-semibold">{item.ratio}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Additional settings */}
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Additional settings (Negative prompt, motion controls)</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 pt-2">
              <div className="space-y-2">
                <label className="block text-xs text-slate-300 font-semibold">
                  Negative Prompt (Elements to avoid)
                </label>
                <textarea
                  rows={3}
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="e.g. morphing artifacts, distorted anatomy, jitter, low resolution, blurry, watermark"
                  className="w-full bg-surface-elevated text-xs text-slate-200 rounded-lg p-2.5 border border-white/10 focus:border-teal-500 outline-none resize-none leading-relaxed"
                />
                <span className="text-[10px] text-slate-500 block">
                  Instructs the generative model to exclude visual defects or unwanted styles.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit & Result Summary Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="space-y-1 text-left w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Info className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>
                Estimated cost: <strong className="text-teal-300 font-mono text-sm">{currentCost} credits</strong> ({duration}s @ {getCostPerSecond(resolution)} credits/s{referenceImageUrl ? ' + 1 credit start frame' : ''})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono pl-6">
              2 credits per second at 480p, 3 at 720p, 14 at 1080p (720p upscaled). An image-to-video start frame adds 1 credit.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-surface-elevated text-slate-400 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>

            <button
              type="submit"
              disabled={!prompt.trim() || isSubmitting}
              className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Generating Video...
                </>
              ) : referenceImageUrl ? (
                <>
                  <ImageIcon className="w-4 h-4 font-bold" />
                  Run (Image-to-Video)
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 font-bold" />
                  Run (Generate Video)
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
