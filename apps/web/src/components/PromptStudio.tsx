import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Sliders, 
  Image as ImageIcon, 
  Video, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Upload,
  X,
  Loader2,
  RotateCcw,
  AlertCircle,
  Cpu,
  ChevronRight,
  Coins
} from 'lucide-react';
import { 
  AspectRatio, 
  VideoDuration, 
  VideoResolution, 
  VideoModelInfo, 
  GenerateVideoRequest 
} from '@videolab/shared';
import { enhancePrompt, uploadReferenceImage } from '../services/api.js';
import { ModelPickerModal } from './ModelPickerModal.js';

interface PromptStudioProps {
  models: VideoModelInfo[];
  selectedModel: VideoModelInfo | null;
  onSelectModel: (model: VideoModelInfo) => void;
  onSubmit: (request: GenerateVideoRequest) => Promise<void>;
  isSubmitting: boolean;
  initialValues?: Partial<GenerateVideoRequest> | null;
}

const ALL_ASPECT_RATIOS: { ratio: AspectRatio; label: string; iconClass: string }[] = [
  { ratio: 'auto', label: 'Auto (Model picks ratio)', iconClass: 'w-5 h-4 border-2 border-dashed' },
  { ratio: '16:9', label: 'Landscape (16:9)', iconClass: 'w-6 h-3.5 border-2' },
  { ratio: '9:16', label: 'Portrait / Reels (9:16)', iconClass: 'w-3.5 h-6 border-2' },
  { ratio: '1:1', label: 'Square (1:1)', iconClass: 'w-5 h-5 border-2' },
  { ratio: '4:3', label: 'Standard (4:3)', iconClass: 'w-5.5 h-4 border-2' },
];

const PRESET_PROMPTS = [
  'A majestic white dove soaring peacefully across a radiant sunrise sky above calm sapphire waters',
  'The paper dragon lifts its head, unfurls its wings, and launches from the desk as loose sketches flutter through warm window light, smooth handheld push-in.',
  'Raindrops freeze in midair then drift sideways; the bronze horse statue\'s tail unspools into copper wire that coils in a warm wind; camera slow push-in, wet plaza stays, photoreal.',
  'A neon-lit cyberpunk samurai standing under rain in futuristic Neo-Tokyo alleyway',
];

export const PromptStudio: React.FC<PromptStudioProps> = ({
  models,
  selectedModel,
  onSelectModel,
  onSubmit,
  isSubmitting,
  initialValues,
}) => {
  const activeModel = selectedModel || models[0];

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
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initialValues (e.g. from history remix)
  useEffect(() => {
    if (!initialValues) return;
    if (initialValues.prompt) setPrompt(initialValues.prompt);
    if (initialValues.enhancedPrompt) setEnhancedPrompt(initialValues.enhancedPrompt);
    if (initialValues.negativePrompt) setNegativePrompt(initialValues.negativePrompt);
    if (initialValues.referenceImageUrl) setReferenceImageUrl(initialValues.referenceImageUrl);
    if (initialValues.aspectRatio) setAspectRatio(initialValues.aspectRatio);
    if (initialValues.duration) setDuration(initialValues.duration);
    if (initialValues.resolution) setResolution(initialValues.resolution);
  }, [initialValues]);

  // Synchronize defaults when active model changes
  useEffect(() => {
    if (!activeModel) return;

    // Check resolution validity
    if (!activeModel.supportedResolutions.includes(resolution)) {
      setResolution(activeModel.supportedResolutions[0] || '720p');
    }

    // Check duration validity
    if (!activeModel.supportedDurations.includes(duration)) {
      setDuration(activeModel.supportedDurations[0] || 5);
    }

    // Check aspect ratio validity
    if (!activeModel.supportedAspectRatios.includes(aspectRatio)) {
      setAspectRatio(activeModel.supportedAspectRatios[0] || '16:9');
    }
  }, [activeModel?.id]);

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

  const processImageFile = async (file: File) => {
    setIsUploadingImage(true);
    try {
      // 1. Instant local client-side preview via FileReader (guaranteed zero latency)
      const reader = new FileReader();
      reader.onload = (event) => {
        const localDataUri = event.target?.result as string;
        if (localDataUri) {
          setReferenceImageUrl(localDataUri);
        }
      };
      reader.readAsDataURL(file);

      // 2. Also upload to server for persistence
      try {
        const res = await uploadReferenceImage(file);
        if (res.dataUri) {
          setReferenceImageUrl(res.dataUri);
        } else if (res.url) {
          setReferenceImageUrl(res.url);
        }
      } catch (uploadErr) {
        console.warn('[PromptStudio] Background server upload failed, relying on client Data URI:', uploadErr);
      }
    } catch (err: any) {
      alert(`Image processing failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(file.name))) {
      processImageFile(file);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setEnhancedPrompt('');
    setNegativePrompt('');
    setReferenceImageUrl('');
    setAspectRatio(activeModel?.supportedAspectRatios[0] || '16:9');
    setDuration(activeModel?.supportedDurations[0] || 5);
    setResolution(activeModel?.supportedResolutions[0] || '720p');
    setShowAdvanced(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModel || isSubmitting) return;

    // Gen-4 Turbo requires an image
    if (activeModel.id === 'gen4-turbo' && !referenceImageUrl.trim()) {
      alert('Gen-4 Turbo requires a starter image (first frame). Please paste an image URL or upload an image.');
      return;
    }

    if (!prompt.trim() && !referenceImageUrl.trim()) return;

    await onSubmit({
      prompt: prompt.trim() || 'Animate this reference image seamlessly',
      enhancedPrompt: enhancedPrompt.trim() || undefined,
      negativePrompt: negativePrompt.trim() || undefined,
      referenceImageUrl: referenceImageUrl.trim() || undefined,
      modelId: activeModel.id,
      aspectRatio,
      duration,
      resolution,
    });
  };

  // Model-specific pricing calculation (Guaranteed Platform Profit Formula: ceil(wholesale * 1.5) + 2)
  const calculateCost = (): { 
    total: number; 
    wholesale: number;
    platformFee: number;
    rateLabel: string; 
    subtext: string;
  } => {
    const mId = activeModel?.id;
    let wholesale = 15;
    let rateLabel = '3 credits/s';
    let subtext = '2 credits/s at 480p, 3 at 720p, 14 at 1080p. Start frame adds 1 credit.';

    if (mId === 'runway-lite') {
      wholesale = duration * 5;
      rateLabel = '5 credits/s';
      subtext = '5 credits per second of video.';
    } else if (mId === 'gen4-turbo') {
      wholesale = Math.max(10, duration * 5);
      rateLabel = '5 credits/s (min 10)';
      subtext = '5 credits per second of video (minimum 10 credits).';
    } else if (mId === 'wan3-prime') {
      let rate = 14;
      if (resolution === '480p') rate = 6.8;
      else if (resolution === '1080p') rate = 28;
      wholesale = Math.round(duration * rate * 10) / 10;
      rateLabel = `${rate} credits/s`;
      subtext = '6.8 credits/s at 480p, 14 at 720p, 28 at 1080p.';
    } else if (mId === 'h3-max') {
      const rate = resolution === '480p' ? 5 : 8;
      const effectiveDur = Math.max(5, duration);
      wholesale = effectiveDur * rate;
      rateLabel = `${rate} credits/s (5s min)`;
      subtext = '5 credits/s at 480p, 8 credits/s at 768p (5 second minimum).';
    } else {
      // Grok Imagine Video 1.5 Lite
      let rate = 3;
      if (resolution === '480p') rate = 2;
      else if (resolution === '1080p') rate = 14;
      wholesale = duration * rate + (referenceImageUrl ? 1 : 0);
      rateLabel = `${rate} credits/s`;
      subtext = '2 credits/s at 480p, 3 at 720p, 14 at 1080p. Start frame adds 1 credit.';
    }

    const total = Math.ceil(wholesale * 1.5) + 2;
    const platformFee = total - Math.ceil(wholesale);

    return {
      total,
      wholesale: Math.ceil(wholesale),
      platformFee,
      rateLabel,
      subtext,
    };
  };

  const costInfo = calculateCost();
  const isGen4 = activeModel?.id === 'gen4-turbo';
  const supportedRatios = ALL_ASPECT_RATIOS.filter(ar => 
    activeModel?.supportedAspectRatios.includes(ar.ratio)
  );

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleGenerate} className="glass-panel rounded-xl p-4 sm:p-5 border border-white/10 space-y-4">
        
        {/* Generative Model Selector (Click-to-Pop Modal) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Generative Model Provider
            </label>
            <span className="text-[10px] font-mono text-teal-400">
              {models.length} Engines Available
            </span>
          </div>

          <div
            onClick={() => setIsModelModalOpen(true)}
            className="group glass-panel rounded-xl p-2.5 sm:p-3 border border-white/10 hover:border-teal-500/50 bg-surface-elevated/70 hover:bg-surface-elevated/90 cursor-pointer transition-all flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>

              <div className="overflow-hidden">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-white group-hover:text-teal-300 transition-colors">
                    {activeModel?.name || 'Select a Generative Model'}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {activeModel?.id.includes('grok') ? 'xAI' : activeModel?.id.includes('wan') ? 'Alibaba' : activeModel?.id.includes('h3') ? 'MiniMax' : 'Runway'}
                  </span>
                  <span className="text-[10px] font-mono text-teal-400 font-semibold hidden sm:inline">
                    {activeModel?.costPerSecond} c/s
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-lg mt-0.5">
                  {activeModel?.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 group-hover:bg-teal-500 text-teal-300 group-hover:text-slate-950 border border-teal-500/30 text-[11px] font-bold transition-all flex-shrink-0 ml-2"
            >
              <span>Switch</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Modal Dialog for Model Selection */}
        <ModelPickerModal
          isOpen={isModelModalOpen}
          onClose={() => setIsModelModalOpen(false)}
          models={models}
          selectedModel={activeModel}
          onSelectModel={onSelectModel}
        />

        {/* Gen-4 Turbo Notice (if selected) */}
        {isGen4 && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-cyan-200 text-xs">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>
              <strong>Gen-4 Turbo Mode:</strong> Runway Image-to-Video. Please provide a starter frame below.
            </span>
          </div>
        )}

        {/* Image (first frame) / Keyframes Input */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`rounded-lg border p-3 space-y-2 transition-colors ${
            isGen4 
              ? 'border-cyan-500/40 bg-cyan-950/20' 
              : 'border-white/10 bg-surface-elevated/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> 
                {activeModel?.id === 'wan3-prime' || activeModel?.id === 'h3-max' 
                  ? 'Keyframes (start & end)' 
                  : 'Image (first frame)'}
              </label>
              {isGen4 ? (
                <span className="text-[9px] text-amber-300 font-mono bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                  Required
                </span>
              ) : activeModel?.id === 'grok-imagine-1-5-lite' ? (
                <span className="text-[9px] text-teal-400 font-mono bg-teal-500/10 px-1.5 py-0.2 rounded">
                  +1 credit
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 font-mono">
                  Optional
                </span>
              )}
            </div>
            {referenceImageUrl && (
              <button
                type="button"
                onClick={() => setReferenceImageUrl('')}
                className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="url"
              value={referenceImageUrl}
              onChange={(e) => setReferenceImageUrl(e.target.value)}
              placeholder="Paste an image URL (e.g. https://...)"
              className="flex-1 w-full bg-surface-elevated text-xs text-slate-100 placeholder:text-slate-500 rounded-lg px-2.5 py-1.5 border border-white/10 focus:border-teal-500 outline-none font-mono"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*, .png, .jpg, .jpeg, .webp, .avif, .gif, .bmp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                {isUploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                Upload
              </button>
            </div>
          </div>

          {referenceImageUrl && (
            <div className="flex items-center gap-2.5 pt-0.5">
              <img 
                src={referenceImageUrl} 
                alt="First frame" 
                className="w-10 h-10 object-cover rounded-lg border border-teal-500/50 shadow"
              />
              <div className="text-[10px] text-slate-300 truncate font-mono">
                <span className="text-teal-400 font-semibold font-sans">Active Frame:</span> {referenceImageUrl}
              </div>
            </div>
          )}
        </div>

        {/* Visual Prompt Input & AI Enhancer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Visual Prompt*
              </label>
              {referenceImageUrl && (
                <span className="flex items-center gap-1 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <ImageIcon className="w-2.5 h-2.5" /> Image-to-Video
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as any)}
                className="bg-surface-elevated text-[11px] text-slate-300 rounded-md px-2 py-1 border border-white/10 outline-none focus:border-teal-500"
              >
                <option value="cinematic">Cinematic</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="photorealistic">Photoreal</option>
                <option value="anime">Anime</option>
                <option value="3d-render">3D Render</option>
              </select>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value as any)}
                className="bg-surface-elevated text-[11px] text-slate-300 rounded-md px-2 py-1 border border-white/10 outline-none focus:border-teal-500"
              >
                <option value="zoom-in">Zoom In</option>
                <option value="zoom-out">Zoom Out</option>
                <option value="pan-left">Pan Left</option>
                <option value="pan-right">Pan Right</option>
                <option value="drone-shot">Drone Shot</option>
                <option value="orbital">Orbital</option>
              </select>
              <button
                type="button"
                onClick={handleEnhance}
                disabled={!prompt.trim() || isEnhancing}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 hover:text-white text-[11px] font-medium transition-all disabled:opacity-40"
              >
                <Wand2 className={`w-3 h-3 ${isEnhancing ? 'animate-spin' : ''}`} />
                {isEnhancing ? 'Enhancing...' : '✨ Enhance'}
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isGen4
                  ? "Describe motion for the image... (e.g. Smooth camera forward push-in, water cascades down rocks)"
                  : referenceImageUrl 
                  ? "Describe how the first frame should animate... (e.g. Paper dragon lifts head, launches from desk)"
                  : "Describe your scene in detail... (e.g., A majestic white dove soaring peacefully across sunrise sky above sapphire waters)"
              }
              className="w-full bg-surface-elevated/80 border border-white/10 rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none leading-relaxed"
            />
            <div className="absolute right-2.5 bottom-2 text-[9px] text-slate-500 font-mono">
              {prompt.length} chars
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 mr-0.5">
              <Zap className="w-3 h-3 text-amber-400" /> Presets:
            </span>
            {PRESET_PROMPTS.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(sample)}
                className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded-md transition-colors border border-white/5 truncate max-w-[200px]"
                title={sample}
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Enhanced Prompt Display */}
          {enhancedPrompt && (
            <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                <span className="flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3 h-3" /> AI Enhanced Prompt
                </span>
                <button
                  type="button"
                  onClick={() => setEnhancedPrompt('')}
                  className="text-[10px] text-purple-400/70 hover:text-purple-300"
                >
                  Clear
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono bg-black/30 p-2 rounded border border-purple-500/10">
                {enhancedPrompt}
              </p>
            </div>
          )}
        </div>

        {/* Parameters: Resolution, Duration, Aspect Ratio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          
          {/* Resolution */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Resolution*
            </label>
            <div className={`grid gap-1.5 ${activeModel?.supportedResolutions.length === 2 ? 'grid-cols-2' : activeModel?.supportedResolutions.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {activeModel?.supportedResolutions.map((res) => {
                const active = resolution === res;
                let rate = '';
                if (activeModel.id === 'wan3-prime') {
                  rate = res === '480p' ? '6.8 c/s' : res === '720p' ? '14 c/s' : '28 c/s';
                } else if (activeModel.id === 'h3-max') {
                  rate = res === '480p' ? '5 c/s' : '8 c/s';
                } else if (activeModel.id === 'gen4-turbo') {
                  rate = '5 c/s';
                } else {
                  rate = res === '480p' ? '2 c/s' : res === '720p' ? '3 c/s' : '14 c/s';
                }

                return (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`py-1.5 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                      active
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm'
                        : 'bg-surface-elevated/40 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-[11px] font-bold">{res}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{rate}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Duration*
            </label>
            <div className={`grid gap-1.5 ${activeModel?.supportedDurations.length >= 5 ? 'grid-cols-5' : activeModel?.supportedDurations.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {activeModel?.supportedDurations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`py-1.5 px-1 rounded-lg border text-[11px] font-semibold flex flex-col items-center justify-center transition-all ${
                    duration === d
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-surface-elevated/40 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="font-bold">{d}s</span>
                  <span className="text-[9px] text-slate-500 font-normal">sec</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Aspect Ratio*
            </label>
            <div className={`grid gap-1.5 ${supportedRatios.length === 5 ? 'grid-cols-5' : supportedRatios.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {supportedRatios.map((item) => {
                const active = aspectRatio === item.ratio;
                return (
                  <button
                    key={item.ratio}
                    type="button"
                    onClick={() => setAspectRatio(item.ratio)}
                    title={item.label}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border text-center transition-all ${
                      active
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm'
                        : 'bg-surface-elevated/40 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className={`rounded-xs mb-1 flex items-center justify-center ${item.iconClass} ${active ? 'border-teal-400' : 'border-slate-500'}`} />
                    <span className="text-[9px] font-semibold">{item.ratio}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Additional settings */}
        <div className="border-t border-white/10 pt-2.5">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Sliders className="w-3 h-3" />
            <span>Additional settings (Negative prompt, motion controls)</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showAdvanced && (
            <div className="mt-2 pt-1">
              <div className="space-y-1.5">
                <label className="block text-[11px] text-slate-300 font-semibold">
                  Negative Prompt (Elements to avoid)
                </label>
                <textarea
                  rows={2}
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="e.g. morphing artifacts, distorted anatomy, jitter, low resolution, blurry, watermark"
                  className="w-full bg-surface-elevated text-xs text-slate-200 rounded-lg p-2 border border-white/10 focus:border-teal-500 outline-none resize-none leading-relaxed"
                />
                <span className="text-[9px] text-slate-500 block">
                  Instructs the generative model to exclude visual defects or unwanted styles.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit & Result Summary Bar (Ultra-Compact Single-Row) */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/10">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Coins className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
              <span className="whitespace-nowrap text-[11px] sm:text-xs">
                Fee: <strong className="text-teal-300 font-mono">{costInfo.total} credits</strong>
              </span>
            </div>
            <span 
              className="text-[10px] text-slate-500 font-mono truncate hidden sm:inline cursor-help" 
              title={`Wholesale: ${costInfo.subtext} (${costInfo.wholesale} GPU compute + ${costInfo.platformFee} platform orchestration)`}
            >
              • {costInfo.rateLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleReset}
              title="Reset prompt and parameters"
              className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-surface-elevated text-slate-400 hover:text-white text-[11px] font-semibold transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={(!prompt.trim() && !referenceImageUrl.trim()) || (isGen4 && !referenceImageUrl.trim()) || isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : isGen4 || referenceImageUrl ? (
                <>
                  <ImageIcon className="w-3.5 h-3.5 font-bold" />
                  Generate
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5 font-bold" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
