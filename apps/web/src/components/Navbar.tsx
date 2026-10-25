import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Sparkles, 
  Coins, 
  Settings, 
  ShieldCheck, 
  PlusCircle, 
  ChevronDown, 
  X, 
  Film, 
  Check 
} from 'lucide-react';
import { UserCredits } from '@videolab/shared';

interface NavbarProps {
  activeTab: 'studio' | 'history' | 'admin';
  setActiveTab: (tab: 'studio' | 'history' | 'admin') => void;
  credits: UserCredits | null;
  activeJobsCount: number;
  completedJobsCount?: number;
  onOpenJobDrawer: () => void;
  onOpenSettings: () => void;
  onOpenPricing?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  credits,
  activeJobsCount,
  completedJobsCount = 0,
  onOpenJobDrawer,
  onOpenSettings,
  onOpenPricing,
}) => {
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsNavModalOpen(false);
    };
    if (isNavModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNavModalOpen]);

  const selectTab = (tab: 'studio' | 'history' | 'admin') => {
    setActiveTab(tab);
    setIsNavModalOpen(false);
  };

  const navItems = [
    {
      id: 'studio' as const,
      name: 'Generate Video',
      category: 'Creation Studio',
      badge: 'Active Studio',
      description: 'Text & image to video generation with Runway Gen-4, Grok 1.5 Lite, WAN 3.0 & MiniMax engines.',
      icon: Sparkles,
      color: 'teal',
      accentBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      activeBorder: 'border-teal-500/60 bg-teal-950/20',
    },
    {
      id: 'history' as const,
      name: 'Video History & Archive',
      category: 'Render Library',
      badge: `${completedJobsCount} Rendered`,
      description: 'Archive of all completed video renders, cinema playback, MP4 downloads & 1-click prompt remixing.',
      icon: Film,
      color: 'cyan',
      accentBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      activeBorder: 'border-cyan-500/60 bg-cyan-950/20',
    },
    {
      id: 'admin' as const,
      name: 'Admin & Financial Audit',
      category: 'Operations',
      badge: 'Free Route',
      description: 'Real-time reconciliation of Runway wholesale API costs ($0.01/c) vs platform revenue & margins.',
      icon: ShieldCheck,
      color: 'emerald',
      accentBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      activeBorder: 'border-emerald-500/60 bg-emerald-950/20',
    },
  ];

  const currentTab = navItems.find((item) => item.id === activeTab) || navItems[0];
  const CurrentIcon = currentTab.icon;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 glass-panel bg-background/80 backdrop-blur-md w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between relative">
        
        {/* Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => setActiveTab('studio')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-300 to-white">
                NovaMotion
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-teal-500/20 text-teal-300 rounded border border-teal-500/30">
                AI Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Text & Image to Cinematic Video</p>
          </div>
        </div>

        {/* Center: Dropdown Modal Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsNavModalOpen(!isNavModalOpen)}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-md group ${
              isNavModalOpen
                ? 'bg-surface-elevated border-teal-500/50 text-white shadow-teal-500/10'
                : 'bg-surface-elevated/80 hover:bg-surface-elevated border-white/10 hover:border-teal-500/30 text-slate-200'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-teal-400 group-hover:scale-125 transition-transform" />
            <CurrentIcon className="w-4 h-4 text-teal-300" />
            <span className="font-medium text-sm text-white">
              {currentTab.name}
            </span>
            {activeTab === 'admin' && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded uppercase font-mono font-bold">
                Free
              </span>
            )}
            <ChevronDown 
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isNavModalOpen ? 'rotate-180 text-teal-400' : 'group-hover:text-white'
              }`} 
            />
          </button>
        </div>

        {/* Right status & controls */}
        <div className="flex items-center gap-3">
          {/* Active Job Tracker Button */}
          <button
            onClick={onOpenJobDrawer}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all ${
              activeJobsCount > 0
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeJobsCount > 0 ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
            <span className="hidden sm:inline">Queue</span>
            {activeJobsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold text-xs rounded-full">
                {activeJobsCount}
              </span>
            )}
          </button>

          {/* Credits Badge with Top Up */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenPricing}
              title="Click to view pricing & top up credits"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-950/40 hover:bg-teal-900/50 border border-teal-500/30 hover:border-teal-400 text-teal-300 text-sm font-medium transition-all cursor-pointer shadow-sm shadow-teal-950/20"
            >
              <Coins className="w-4 h-4 text-teal-400" />
              <span className="font-mono font-bold">{credits ? credits.available : '...'}</span>
              <span className="text-xs text-teal-400/70 font-normal hidden sm:inline">credits</span>
            </button>
            <button
              type="button"
              onClick={onOpenPricing}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 text-xs font-bold shadow-sm shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Top Up</span>
            </button>
          </div>

          {/* Settings API Keys Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Configure Provider API Keys"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Dropdown Modal Overlay & Menu Card */}
      {isNavModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsNavModalOpen(false)}
          />

          {/* Dropdown Modal Card */}
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="glass-panel-elevated rounded-2xl border border-white/15 p-5 shadow-2xl space-y-4 bg-surface-elevated/95 backdrop-blur-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-white tracking-wide">
                      NovaMotion Workspaces
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Navigation
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a workspace or tool to switch contexts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNavModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Options List */}
              <div className="space-y-2.5">
                {navItems.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => selectTab(item.id)}
                      className={`group p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        isActive
                          ? `${item.activeBorder} shadow-lg`
                          : 'border-white/10 hover:border-teal-500/30 bg-surface/40 hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${item.accentBg} border flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <ItemIcon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                              {item.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded uppercase bg-white/5 text-slate-400 border border-white/10">
                              {item.category}
                            </span>
                          </div>
                          {isActive ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-teal-300 bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px] text-slate-500">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">Esc</kbd> to close
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavModalOpen(false);
                      onOpenPricing?.();
                    }}
                    className="text-teal-400 hover:text-teal-300 font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Credit Packages</span>
                    <Coins className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </header>
  );
};

