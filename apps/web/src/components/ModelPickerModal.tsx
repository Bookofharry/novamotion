import React from 'react';
import { 
  X, 
  Check, 
  Cpu, 
  Zap, 
  Sparkles, 
  Video, 
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { VideoModelInfo } from '@videolab/shared';

interface ModelPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: VideoModelInfo[];
  selectedModel: VideoModelInfo | null;
  onSelectModel: (model: VideoModelInfo) => void;
}

export const ModelPickerModal: React.FC<ModelPickerModalProps> = ({
  isOpen,
  onClose,
  models,
  selectedModel,
  onSelectModel,
}) => {
  if (!isOpen) return null;

  const handleSelect = (model: VideoModelInfo) => {
    onSelectModel(model);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl glass-panel rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl bg-surface-elevated/95 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Glow backdrop decorative effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-teal-500/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between relative flex-shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-wide">
                Select Generative Video Model
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400">
              Choose from {models.length} live foundation engines tailored for real-time speed, fidelity, or camera motion.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Models Selection Cards Grid */}
        <div className="overflow-y-auto pr-1 space-y-3.5 flex-1">
          {models.map((m) => {
            const isSelected = selectedModel?.id === m.id;
            let badgeColor = 'bg-teal-500/20 text-teal-300 border-teal-500/30';
            let badgeText = 'xAI';
            let rateTag = '2-14 c/s';
            let categoryTag = 'Fast & Low Cost';

            if (m.id === 'runway-lite') {
              badgeColor = 'bg-teal-500/20 text-teal-300 border-teal-500/30';
              badgeText = 'Runway';
              rateTag = '5 c/s';
              categoryTag = 'Rapid Concept Iteration';
            } else if (m.id === 'gen4-turbo') {
              badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
              badgeText = 'Runway';
              rateTag = '5 c/s (min 10c)';
              categoryTag = 'Fastest Image-to-Video';
            } else if (m.id === 'wan3-prime') {
              badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              badgeText = 'Alibaba';
              rateTag = '6.8-28 c/s';
              categoryTag = 'Native Audio & High-Speed';
            } else if (m.id === 'h3-max') {
              badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
              badgeText = 'MiniMax';
              rateTag = '5-8 c/s';
              categoryTag = 'Cinematic Motion & Physics';
            }

            return (
              <div
                key={m.id}
                onClick={() => handleSelect(m)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-gradient-to-r from-teal-950/50 via-surface-elevated to-teal-950/20 border-teal-500 ring-1 ring-teal-500/30 shadow-lg shadow-teal-500/10'
                    : 'bg-surface-elevated/40 border-white/10 hover:border-white/20 hover:bg-surface-elevated/70'
                }`}
              >
                {/* Left details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-white">{m.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${badgeColor}`}>
                      {badgeText}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {categoryTag}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Engine
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {m.description}
                  </p>

                  {/* Capabilities pill tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      {m.supportsTextToVideo && <Video className="w-3 h-3 text-teal-400" />}
                      {m.supportsTextToVideo ? 'Text-to-Video' : ''}
                    </span>
                    {m.supportsImageToVideo && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-cyan-400" />
                        Image-to-Video
                      </span>
                    )}
                    <span>•</span>
                    <span>Max {m.supportedResolutions[m.supportedResolutions.length - 1]}</span>
                    <span>•</span>
                    <span>{m.supportedDurations.join('s, ')}s</span>
                  </div>
                </div>

                {/* Right Action & Rate Tag */}
                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center gap-2 flex-shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-white/5">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-teal-400 block">{rateTag}</span>
                    <span className="text-[10px] text-slate-400">wholesale rate</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(m);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Select Model</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Foundation engines run live on GPU clusters with no mock data
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
