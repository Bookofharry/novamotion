import { Video, Sparkles, Layers, Coins, Activity, Settings, Clapperboard, Music, ShieldCheck, PlusCircle } from 'lucide-react';
import { UserCredits } from '@videolab/shared';

interface NavbarProps {
  activeTab: 'studio' | 'gallery' | 'models' | 'sequencer' | 'audio' | 'admin';
  setActiveTab: (tab: 'studio' | 'gallery' | 'models' | 'sequencer' | 'audio' | 'admin') => void;
  credits: UserCredits | null;
  activeJobsCount: number;
  onOpenJobDrawer: () => void;
  onOpenSettings: () => void;
  onOpenPricing?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  credits,
  activeJobsCount,
  onOpenJobDrawer,
  onOpenSettings,
  onOpenPricing,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 glass-panel bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Video className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                VideoLab
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-teal-500/20 text-teal-300 rounded border border-teal-500/30">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Provider-Independent Generative Video</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-surface-elevated/70 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Studio
          </button>
          <button
            onClick={() => setActiveTab('sequencer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'sequencer'
                ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            Sequencer
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'audio'
                ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Soundtrack Studio
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'gallery'
                ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Library
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'models'
                ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Models
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-500/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin</span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded uppercase font-mono font-bold">
              Free
            </span>
          </button>
        </nav>

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
            Queue
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
              <span className="text-xs text-teal-400/70 font-normal">credits</span>
            </button>
            <button
              type="button"
              onClick={onOpenPricing}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 text-xs font-bold shadow-sm shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Top Up</span>
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
    </header>
  );
};
