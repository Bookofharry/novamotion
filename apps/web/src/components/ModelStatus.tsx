import React from 'react';
import { VideoModelInfo } from '@videolab/shared';
import { CheckCircle2, Cpu, ShieldCheck } from 'lucide-react';

interface ModelStatusProps {
  models: VideoModelInfo[];
}

export const ModelStatus: React.FC<ModelStatusProps> = ({ models }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Provider & Model Adapters</h2>
        <p className="text-xs text-slate-400 mt-1">
          VideoLab standardizes external generative AI models into a unified orchestration layer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((m) => (
          <div key={m.id} className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base text-white">{m.name}</h3>
                  {m.isDefault && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Active Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{m.description}</p>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-white/5 border border-white/10 text-slate-300">
                {m.provider}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-surface-elevated/50 p-3 rounded-xl border border-white/5">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Ratios</span>
                <span className="text-slate-300 font-medium">{m.supportedAspectRatios.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Resolutions</span>
                <span className="text-slate-300 font-medium">{m.supportedResolutions.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Durations</span>
                <span className="text-slate-300 font-medium">{m.supportedDurations.map(d => `${d}s`).join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Cost</span>
                <span className="text-teal-400 font-medium">{m.costPerSecond} credits/sec</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Adapter Ready
              </span>
              <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Standardized API
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0 text-teal-400">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-white">Provider-Independent Orchestration</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Requests are automatically routed to the corresponding provider adapter (<code className="text-teal-300">IVideoProvider</code>), which maps parameters, manages async polling or webhooks, downloads output streams, and reports status back to the client.
          </p>
        </div>
      </div>
    </div>
  );
};
