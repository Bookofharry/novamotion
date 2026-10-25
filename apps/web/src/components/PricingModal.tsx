import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Coins, 
  ShieldCheck, 
  Zap, 
  CreditCard,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { CreditPackage } from '@videolab/shared';
import { fetchCreditPackages, purchaseCreditPackage } from '../services/api.js';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreditPurchased?: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onCreditPurchased,
}) => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCreditPackages()
        .then(setPackages)
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePurchase = async (pkg: CreditPackage) => {
    setPurchasingId(pkg.id);
    try {
      await purchaseCreditPackage(pkg.id);
      setSuccessMessage(`Successfully added +${pkg.credits.toLocaleString()} credits to your account!`);
      if (onCreditPurchased) onCreditPurchased();
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(`Purchase simulation failed: ${err.message}`);
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl glass-panel rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl bg-surface-elevated/95 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Glow backdrop decorative effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-teal-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Coins className="w-5 h-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-wide">
                VideoLab Generation Credits
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400">
              Fuel your video productions with high-performance GPU credits. Pay as you create — credits never expire.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {packages.map((pkg) => {
            const isPopular = pkg.popular;
            const isProcessing = purchasingId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all relative ${
                  isPopular
                    ? 'bg-gradient-to-b from-teal-950/40 via-surface-elevated to-slate-900 border-teal-500/60 shadow-xl shadow-teal-500/15 scale-[1.02]'
                    : 'bg-surface-elevated/60 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Popular Pill */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-white">{pkg.name}</h3>
                    {pkg.savingsPercent && (
                      <span className="text-[10px] font-bold text-teal-300 bg-teal-500/20 border border-teal-500/30 px-1.5 py-0.5 rounded">
                        Save {pkg.savingsPercent}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{pkg.description}</p>

                  <div className="mb-4 pb-4 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        ${pkg.priceUsd.toFixed(0)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">USD</span>
                    </div>
                    <div className="text-[11px] font-mono text-teal-400 mt-1">
                      <strong>{pkg.credits.toLocaleString()}</strong> credits (~${pkg.costPerCreditUsd.toFixed(3)}/c)
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handlePurchase(pkg)}
                  disabled={Boolean(purchasingId)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    isPopular
                      ? 'bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 text-slate-950 shadow-md shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                  } disabled:opacity-50`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Processing Checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      Top Up {pkg.credits.toLocaleString()} Credits
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantees */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Instant Activation
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Never Expire
            </span>
          </div>
          <span className="font-mono">
            Platform markup guarantees 100% sustainable GPU uptime
          </span>
        </div>

      </div>
    </div>
  );
};
