import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  AlertOctagon,
  Layers,
  Scale,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';
import { ComponentDetail, ComponentResult } from '../../types';

interface ComponentIntelligenceProps {
  componentDetail?: ComponentDetail | null;
  componentResult?: ComponentResult | null;
  isLoading?: boolean;
}

export const ComponentIntelligence: React.FC<ComponentIntelligenceProps> = ({
  componentDetail,
  componentResult,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-space-900 border-l border-slate-800 p-4 items-center justify-center text-xs font-mono text-slate-500 animate-pulse">
        Retrieving component screening intelligence...
      </div>
    );
  }

  if (!componentDetail && !componentResult) {
    return (
      <div className="flex flex-col h-full bg-space-900 border-l border-slate-800 p-6 items-center justify-center text-center">
        <Info className="w-8 h-8 text-slate-600 mb-2" />
        <span className="text-xs font-mono text-slate-400 font-medium">NO COMPONENT SELECTED</span>
        <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
          Click any component from the monitor table or 3D spacecraft to inspect screening telemetry.
        </p>
      </div>
    );
  }

  const compId = componentResult?.component_id || componentDetail?.component_id || '';
  const subsystem = componentResult?.subsystem || componentDetail?.subsystem || '';
  const lotId = componentResult?.lot_id || componentDetail?.lot_id || '';
  const param = componentResult?.parameter || 'Standard Measurement';
  const currentVal = componentResult?.current_value ?? (componentDetail?.measurements.slice(-1)[0]?.value ?? 0);
  const limit = componentResult?.datasheet_limit ?? (componentDetail?.measurements.slice(-1)[0]?.datasheet_limit ?? 50);
  const risk = componentResult?.risk_score ?? 15;
  const decision = componentResult?.decision || 'SAFE';
  const anomalyScore = componentResult?.anomaly_score ?? 0.1;
  const lotZScore = componentResult?.lot_relative_score ?? 0.2;
  const driftRate = componentResult?.drift_rate ?? 0.005;
  const predictedVal = componentResult?.predicted_value;
  const predConfidence = componentResult?.prediction_confidence || 'High';
  const explanation = componentResult?.explanation || 'Component operating within nominal parameters.';

  const isWithinLimit = currentVal < limit;
  const isAnomalous = decision !== 'SAFE';

  return (
    <div className="flex flex-col h-full bg-space-900 border-l border-slate-800 select-none overflow-y-auto">
      {/* Intelligence Header */}
      <div className="p-3.5 border-b border-slate-800 bg-space-950/40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-mono font-bold text-white tracking-wide">
              {compId}
            </span>
            <div className="text-[11px] font-mono text-slate-400">
              {subsystem} • {lotId}
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-mono font-bold border flex items-center space-x-1 ${
              decision === 'REJECT'
                ? 'bg-rose-950/70 border-rose-500/50 text-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse'
                : decision === 'MONITOR'
                ? 'bg-amber-950/70 border-amber-500/50 text-amber-400'
                : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400'
            }`}
          >
            {decision === 'REJECT' ? (
              <AlertOctagon className="w-3.5 h-3.5" />
            ) : decision === 'MONITOR' ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>{decision}</span>
          </div>
        </div>
      </div>

      <div className="p-3.5 space-y-3.5 flex-1">
        {/* TRADITIONAL VS AI COMPARISON CARD (Core SIH Concept!) */}
        <div className="rounded-lg border border-slate-700/80 bg-space-850 p-3 shadow-md">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Scale className="w-3 h-3 text-cyber-cyan" />
              <span>Datasheet vs AI Screening</span>
            </span>
            {isWithinLimit && isAnomalous && (
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                Within Limit ≠ Healthy
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Traditional Check */}
            <div className="p-2 rounded bg-space-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">TRADITIONAL</span>
              <span
                className={`font-bold text-xs ${
                  isWithinLimit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isWithinLimit ? 'PASS (Inside Spec)' : 'FAIL (Exceeded)'}
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {currentVal.toFixed(1)} &lt; {limit.toFixed(1)}
              </div>
            </div>

            {/* SPACEGUARD AI Check */}
            <div className="p-2 rounded bg-space-950 border border-slate-800">
              <span className="text-[10px] text-cyber-cyan block">SPACEGUARD AI</span>
              <span
                className={`font-bold text-xs ${
                  decision === 'REJECT'
                    ? 'text-rose-400'
                    : decision === 'MONITOR'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {decision === 'REJECT'
                  ? 'CRITICAL RISK'
                  : decision === 'MONITOR'
                  ? 'ELEVATED RISK'
                  : 'NORMAL'}
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Risk: <span className="text-white font-bold">{risk.toFixed(0)}</span> / 100
              </div>
            </div>
          </div>
        </div>

        {/* RISK GAUGE & METRICS GRID */}
        <div className="rounded-lg border border-slate-800 bg-space-850 p-3">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-400">COMPOSITE RISK INDEX</span>
            <span
              className={`text-base font-bold font-mono ${
                risk >= 70 ? 'text-rose-400' : risk >= 35 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {risk.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </span>
          </div>

          <div className="w-full bg-space-950 h-2 rounded-full overflow-hidden border border-slate-800 mb-3">
            <div
              className={`h-full transition-all duration-500 ${
                risk >= 70
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : risk >= 35
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, risk))}%` }}
            />
          </div>

          {/* 4 Quantitative Telemetry Gauges */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Anomaly Score */}
            <div className="p-2 rounded bg-space-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">ANOMALY SCORE</span>
              <span className="text-slate-200 font-bold">{(anomalyScore * 100).toFixed(0)}%</span>
              <span className="text-[10px] text-slate-500 ml-1">
                ({anomalyScore >= 0.65 ? 'High' : 'Normal'})
              </span>
            </div>

            {/* Lot Relative Deviation */}
            <div className="p-2 rounded bg-space-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">LOT Z-SCORE</span>
              <span
                className={`font-bold ${
                  Math.abs(lotZScore) >= 2.5 ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {lotZScore >= 0 ? `+${lotZScore.toFixed(1)}` : lotZScore.toFixed(1)}σ
              </span>
              <span className="text-[10px] text-slate-500 ml-1">vs Lot</span>
            </div>

            {/* Burn-in Drift Rate */}
            <div className="p-2 rounded bg-space-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">DRIFT RATE</span>
              <span className="text-slate-200 font-bold">
                {driftRate >= 0 ? `+${driftRate.toFixed(4)}` : driftRate.toFixed(4)}
              </span>
              <span className="text-[10px] text-slate-500 ml-1">/ hr</span>
            </div>

            {/* Projected 250h Value */}
            <div className="p-2 rounded bg-space-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">PREDICTED @250H</span>
              <span
                className={`font-bold ${
                  predictedVal && predictedVal >= limit ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {predictedVal !== null && predictedVal !== undefined
                  ? predictedVal.toFixed(1)
                  : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 ml-1">
                {predictedVal && predictedVal >= limit ? '(Limit Breach)' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* "WHY FLAGGED?" AI Explanatory Diagnosis */}
        <div className="rounded-lg border border-slate-800 bg-space-850 p-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-cyber-cyan mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI RELIABILITY DIAGNOSIS</span>
          </div>

          <div className="text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed bg-space-950/70 p-2.5 rounded border border-slate-800">
            {explanation}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Confidence: {predConfidence}</span>
            </span>
            <span>Model: v1.0.0-isoforest</span>
          </div>
        </div>
      </div>
    </div>
  );
};
