import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  PlusCircle, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Percent, 
  Zap, 
  Coins
} from 'lucide-react';
import { PlatformAuditSummary, JobAuditDetail } from '@videolab/shared';
import { 
  fetchPlatformAudit, 
  adjustUserCredits, 
  setPlatformMarkup, 
  syncJobWithRunway, 
  deleteJob, 
  checkRunwayStatus 
} from '../services/api.js';

interface AdminStudioProps {
  onRefreshCredits?: () => void;
  onPreviewVideo?: (videoUrl: string, title: string) => void;
}

export const AdminStudio: React.FC<AdminStudioProps> = ({ 
  onRefreshCredits,
  onPreviewVideo 
}) => {
  const [audit, setAudit] = useState<PlatformAuditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [runwayStatus, setRunwayStatus] = useState<{ ok: boolean; latencyMs: number; message: string } | null>(null);
  const [isTestingRunway, setIsTestingRunway] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [customCreditAmount, setCustomCreditAmount] = useState<number>(50);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modelFilter, setModelFilter] = useState<string>('ALL');

  const loadAuditData = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchPlatformAudit();
      setAudit(data);
    } catch (err: any) {
      console.error(err);
      setActionMessage(`Error loading audit: ${err.message}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  const handleAdjustCredits = async (amount: number) => {
    try {
      await adjustUserCredits(amount);
      setActionMessage(`Successfully adjusted credits by ${amount > 0 ? '+' : ''}${amount}!`);
      loadAuditData();
      if (onRefreshCredits) onRefreshCredits();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(`Failed to adjust credits: ${err.message}`);
    }
  };

  const handleSetMarkup = async (multiplier: number) => {
    try {
      await setPlatformMarkup(multiplier);
      setActionMessage(`Platform pricing markup set to ${multiplier}x!`);
      loadAuditData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(`Failed to update markup: ${err.message}`);
    }
  };

  const handleSyncJob = async (jobId: string) => {
    try {
      await syncJobWithRunway(jobId);
      setActionMessage('Job successfully synchronized with Runway Dev API!');
      loadAuditData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(`Failed to sync job: ${err.message}`);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job from the audit history?')) return;
    try {
      await deleteJob(jobId);
      setActionMessage('Job deleted from audit.');
      loadAuditData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(`Failed to delete job: ${err.message}`);
    }
  };

  const handleTestRunway = async () => {
    setIsTestingRunway(true);
    try {
      const res = await checkRunwayStatus();
      setRunwayStatus(res);
    } catch (err: any) {
      setRunwayStatus({ ok: false, latencyMs: 0, message: err.message });
    } finally {
      setIsTestingRunway(false);
    }
  };

  // Filter jobs
  const filteredJobs = (audit?.jobs || []).filter((j: JobAuditDetail) => {
    if (statusFilter !== 'ALL' && j.status !== statusFilter) return false;
    if (modelFilter !== 'ALL' && j.modelId !== modelFilter) return false;
    return true;
  });

  if (isLoading && !audit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
        <span className="text-xs font-mono text-slate-400">Loading Financial Ledger & Audit...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-wide">
              Financial Audit & Operations Center
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Admin / Free Route
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time reconciliation: Runway API charges ($0.01/credit) vs User Billing, margins, and operational controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadAuditData}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white font-medium transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            Refresh Audit
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{actionMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActionMessage(null)}
            className="text-teal-400 hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Runway Real Cost */}
        <div className="rounded-2xl p-5 border border-rose-500/30 bg-gradient-to-b from-rose-950/25 to-surface-elevated/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Runway API Cost</span>
            <Coins className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            ${audit?.totalRunwayCostUsd.toFixed(2) || '0.00'}{' '}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="text-[11px] font-mono text-rose-300">
            {audit?.totalRunwayCostCredits || 0} Runway credits billed
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Fixed at $0.01 per Runway credit
          </p>
        </div>

        {/* User Billed Revenue */}
        <div className="rounded-2xl p-5 border border-teal-500/30 bg-gradient-to-b from-teal-950/25 to-surface-elevated/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">User Billed</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            ${audit?.totalUserChargedUsd.toFixed(2) || '0.00'}{' '}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="text-[11px] font-mono text-teal-300">
            {audit?.totalUserChargedCredits || 0} Platform credits billed
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Current markup multiplier: {audit?.markupMultiplier || 1.25}x
          </p>
        </div>

        {/* Net Profit Margin */}
        <div className="rounded-2xl p-5 border border-emerald-500/30 bg-gradient-to-b from-emerald-950/25 to-surface-elevated/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Net Profit Margin</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {(audit?.netProfitUsd || 0) >= 0 ? '+' : ''}${audit?.netProfitUsd.toFixed(2) || '0.00'}{' '}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-300">
            {audit?.marginPercentage || 0}% Gross margin
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Platform revenue minus provider costs
          </p>
        </div>

        {/* Total Jobs */}
        <div className="rounded-2xl p-5 border border-purple-500/30 bg-gradient-to-b from-purple-950/25 to-surface-elevated/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Generations</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {audit?.totalJobs || 0}{' '}
            <span className="text-xs font-normal text-slate-400">Jobs</span>
          </div>
          <div className="text-[11px] text-purple-300 flex items-center gap-2">
            <span>✓ {audit?.completedJobs || 0} Succeeded</span>
            <span>✗ {audit?.failedJobs || 0} Failed</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            {audit?.processingJobs || 0} currently processing
          </p>
        </div>

      </div>

      {/* Admin Operations Control Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Operation 1: User Credit Management */}
        <div className="rounded-2xl p-5 border border-white/10 bg-surface-elevated/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Adjust User Credits</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live balance tweak</span>
          </div>
          <p className="text-xs text-slate-400">
            Grant test credits or refund users directly without needing billing integration.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleAdjustCredits(50)}
              className="py-2 px-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-white/10 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              +50c
            </button>
            <button
              type="button"
              onClick={() => handleAdjustCredits(100)}
              className="py-2 px-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-white/10 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              +100c
            </button>
            <button
              type="button"
              onClick={() => handleAdjustCredits(250)}
              className="py-2 px-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-white/10 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              +250c
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="number"
              value={customCreditAmount}
              onChange={(e) => setCustomCreditAmount(parseInt(e.target.value, 10) || 0)}
              className="w-24 bg-surface-elevated border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-teal-500"
              placeholder="Amount"
            />
            <button
              type="button"
              onClick={() => handleAdjustCredits(customCreditAmount)}
              className="flex-1 py-1.5 px-3 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-medium transition-all"
            >
              Apply Custom Amount
            </button>
          </div>
        </div>

        {/* Operation 2: Pricing Markup Multiplier */}
        <div className="rounded-2xl p-5 border border-white/10 bg-surface-elevated/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-white">Platform Pricing Markup</h3>
            </div>
            <span className="text-[10px] text-teal-300 font-mono font-bold">
              {audit?.markupMultiplier || 1.25}x Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Control the platform profit margin above wholesale Runway API costs ($0.01/credit).
          </p>

          <div className="grid grid-cols-4 gap-2">
            {[1.0, 1.25, 1.5, 2.0].map((mult) => {
              const active = audit?.markupMultiplier === mult;
              const label = mult === 1.0 ? 'At Cost' : `+${Math.round((mult - 1) * 100)}%`;
              return (
                <button
                  key={mult}
                  type="button"
                  onClick={() => handleSetMarkup(mult)}
                  className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    active
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold font-mono">{mult}x</span>
                  <span className="text-[9px] text-slate-400 font-sans">{label}</span>
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-slate-500 block pt-1">
            Example: A 15-credit video costs us $0.15. At 1.25x, user is billed $0.19 (+$0.04 profit).
          </span>
        </div>

        {/* Operation 3: Runway API Health & Diagnostic */}
        <div className="rounded-2xl p-5 border border-white/10 bg-surface-elevated/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Runway API Diagnostic</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">v1 REST API</span>
          </div>
          <p className="text-xs text-slate-400">
            Verify real-time connectivity to Runway Dev API and measure key latency.
          </p>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1 font-mono">
            {runwayStatus ? (
              <div className="flex items-center gap-2">
                {runwayStatus.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                <span className={runwayStatus.ok ? 'text-emerald-300 truncate' : 'text-rose-300 truncate'}>
                  {runwayStatus.message}
                </span>
              </div>
            ) : (
              <div className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Ready to ping Runway Dev API
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleTestRunway}
            disabled={isTestingRunway}
            className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isTestingRunway ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Pinging Runway...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Ping Runway Dev API
              </>
            )}
          </button>
        </div>

      </div>

      {/* Per-Model Breakdown Table */}
      <div className="rounded-2xl border border-white/10 bg-surface-elevated/40 overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Model Unit Economics Breakdown</h3>
            <p className="text-xs text-slate-400">Cost per second vs user revenue per engine</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Generative Engine</th>
                <th className="pb-3 font-semibold">Wholesale Rate</th>
                <th className="pb-3 font-semibold text-center">Jobs Run</th>
                <th className="pb-3 font-semibold text-right">Runway Cost</th>
                <th className="pb-3 font-semibold text-right">User Billed</th>
                <th className="pb-3 font-semibold text-right">Gross Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {audit?.modelStats.map((ms) => {
                let rateDesc = '';
                if (ms.modelId === 'grok-imagine-1-5-lite') rateDesc = '2-14 c/s ($0.02-$0.14/s)';
                else if (ms.modelId === 'gen4-turbo') rateDesc = '5 c/s ($0.05/s, min 10c)';
                else if (ms.modelId === 'wan3-prime') rateDesc = '6.8-28 c/s ($0.068-$0.28/s)';
                else if (ms.modelId === 'h3-max') rateDesc = '5-8 c/s ($0.05-$0.08/s)';
                else rateDesc = '12 c/s ($0.12/s)';

                return (
                  <tr key={ms.modelId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-sans font-medium text-white">
                      {ms.modelName}
                    </td>
                    <td className="py-3 text-slate-400 text-[11px]">
                      {rateDesc}
                    </td>
                    <td className="py-3 text-center text-slate-300">
                      {ms.totalJobs} <span className="text-[10px] text-slate-500">({ms.completedJobs} done)</span>
                    </td>
                    <td className="py-3 text-right text-rose-300">
                      ${ms.runwayCostUsd.toFixed(2)}{' '}
                      <span className="text-[10px] text-slate-500">({ms.runwayCostCredits}c)</span>
                    </td>
                    <td className="py-3 text-right text-teal-300">
                      ${ms.userChargedUsd.toFixed(2)}{' '}
                      <span className="text-[10px] text-slate-500">({ms.userChargedCredits}c)</span>
                    </td>
                    <td className={`py-3 text-right font-bold ${ms.marginUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {ms.marginUsd >= 0 ? '+' : ''}${ms.marginUsd.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Job Audit Log Table */}
      <div className="rounded-2xl border border-white/10 bg-surface-elevated/40 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Jobs Audit Log</h3>
            <p className="text-xs text-slate-400">Live ledger of all generations with exact Runway invoice comparison</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-elevated text-xs text-slate-300 rounded-lg px-2.5 py-1.5 border border-white/10 outline-none focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="PROCESSING">Processing</option>
            </select>

            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="bg-surface-elevated text-xs text-slate-300 rounded-lg px-2.5 py-1.5 border border-white/10 outline-none focus:border-teal-500"
            >
              <option value="ALL">All Models</option>
              {audit?.modelStats.map(m => (
                <option key={m.modelId} value={m.modelId}>{m.modelName}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No generation jobs found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Time & ID</th>
                  <th className="pb-3 font-semibold">Engine & Prompt</th>
                  <th className="pb-3 font-semibold">Specs</th>
                  <th className="pb-3 font-semibold text-right">Runway Cost</th>
                  <th className="pb-3 font-semibold text-right">User Billed</th>
                  <th className="pb-3 font-semibold text-right">Margin</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 text-slate-400">
                      <div>{new Date(job.createdAt).toLocaleTimeString()}</div>
                      <div className="text-[9px] text-slate-500">{new Date(job.createdAt).toLocaleDateString()}</div>
                      <div className="text-[9px] text-teal-400 font-mono truncate max-w-[80px]" title={job.id}>
                        {job.id.slice(0, 8)}...
                      </div>
                    </td>

                    <td className="py-3 font-sans max-w-xs pr-4">
                      <span className="font-semibold text-slate-200 block text-xs truncate">
                        {job.modelName}
                      </span>
                      <p className="text-[11px] text-slate-400 truncate leading-relaxed" title={job.prompt}>
                        {job.prompt}
                      </p>
                    </td>

                    <td className="py-3 text-slate-300">
                      <div>{job.duration}s • {job.resolution}</div>
                      <div className="text-[10px] text-slate-500">{job.aspectRatio}</div>
                    </td>

                    <td className="py-3 text-right text-rose-300 font-bold">
                      ${job.providerCostUsd.toFixed(2)}
                      <div className="text-[10px] text-slate-500 font-normal">
                        {job.providerCostCredits} credits
                      </div>
                    </td>

                    <td className="py-3 text-right text-teal-300 font-bold">
                      ${job.userChargedUsd.toFixed(2)}
                      <div className="text-[10px] text-slate-500 font-normal">
                        {job.userChargedCredits} credits
                      </div>
                    </td>

                    <td className={`py-3 text-right font-bold ${job.marginUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {job.marginUsd >= 0 ? '+' : ''}${job.marginUsd.toFixed(2)}
                    </td>

                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        job.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : job.status === 'FAILED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      }`}>
                        {job.status}
                      </span>
                    </td>

                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {job.resultVideoUrl && onPreviewVideo && (
                          <button
                            type="button"
                            onClick={() => onPreviewVideo(job.resultVideoUrl!, job.prompt)}
                            title="Play Video"
                            className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {job.providerJobId && (
                          <button
                            type="button"
                            onClick={() => handleSyncJob(job.id)}
                            title="Sync live status and cost from Runway"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job.id)}
                          title="Delete from audit"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
