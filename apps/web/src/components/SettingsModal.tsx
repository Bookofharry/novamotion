import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, CheckCircle2, AlertCircle, Save, Loader2, ExternalLink } from 'lucide-react';
import { fetchProviderKeys, updateProviderKeys, ProviderKeysStatus } from '../services/api.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [keysStatus, setKeysStatus] = useState<ProviderKeysStatus | null>(null);
  const [runwayKeyInput, setRunwayKeyInput] = useState('');
  const [googleKeyInput, setGoogleKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadKeys();
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const loadKeys = async () => {
    try {
      const data = await fetchProviderKeys();
      setKeysStatus(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProviderKeys({
        runwayKey: runwayKeyInput ? runwayKeyInput.trim() : undefined,
        googleKey: googleKeyInput ? googleKeyInput.trim() : undefined,
      });
      setSaveSuccess(true);
      setRunwayKeyInput('');
      setGoogleKeyInput('');
      await loadKeys();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save keys: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-2xl glass-panel-elevated border border-white/10 p-6 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">AI Provider API Keys</h3>
                <p className="text-xs text-slate-400">Configure external credentials for live model generation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Google Veo 2 / Gemini */}
            <div className="space-y-1.5 bg-surface-elevated/40 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span>Google AI Studio Key</span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20 font-bold">
                    VEO 2
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  {keysStatus?.hasGoogleKey ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Configured ({keysStatus.googleKeyMasked})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Not Set
                    </span>
                  )}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center gap-0.5 underline"
                  >
                    Get Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <input
                type="password"
                value={googleKeyInput}
                onChange={(e) => setGoogleKeyInput(e.target.value)}
                placeholder={keysStatus?.hasGoogleKey ? "Enter new key to replace..." : "AIzaSy..."}
                className="w-full bg-surface-elevated text-xs text-white rounded-lg p-2.5 border border-white/10 focus:border-teal-500 outline-none font-mono"
              />
            </div>

            {/* Runway Gen-3 Alpha */}
            <div className="space-y-1.5 bg-surface-elevated/40 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span>Runway API Key</span>
                  <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20 font-bold">
                    GEN-3 ALPHA
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  {keysStatus?.hasRunwayKey ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Configured ({keysStatus.runwayKeyMasked})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Not Set
                    </span>
                  )}
                  <a
                    href="https://runwayml.com/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center gap-0.5 underline"
                  >
                    Get Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <input
                type="password"
                value={runwayKeyInput}
                onChange={(e) => setRunwayKeyInput(e.target.value)}
                placeholder={keysStatus?.hasRunwayKey ? "Enter new key to replace..." : "rw_..."}
                className="w-full bg-surface-elevated text-xs text-white rounded-lg p-2.5 border border-white/10 focus:border-teal-500 outline-none font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/20 text-[11px] text-slate-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                You can generate unlimited videos for free without keys using the <strong>VideoLab Ultra-Fast (Dev Mock)</strong> model. External keys are only required for live Google Veo and Runway model calls.
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              {saveSuccess ? (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Keys updated successfully!
                </span>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || (!runwayKeyInput.trim() && !googleKeyInput.trim())}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save API Keys
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
