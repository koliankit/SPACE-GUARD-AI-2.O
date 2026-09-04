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
  Clock,
  Activity,
  Crosshair,
  Radio,
  FileCheck
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
      <div className="flex flex-col h-full bg-[#060D1A] border-l border-[#1E3A6E] p-4 items-center justify-center text-xs font-mono text-slate-500 animate-pulse">
        PROCESSING FLIGHT INTELLIGENCE TELEMETRY...
      </div>
    );
  }

  if (!componentDetail && !componentResult) {
    return (
      <div className="flex flex-col h-full bg-[#060D1A] border-l border-[#1E3A6E] p-6 items-center justify-center text-center font-mono">
        <Crosshair className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
        <span className="text-xs font-bold text-[#00E5FF] tracking-wider">AWAITING TARGET LOCK</span>
        <p className="text-[10px] text-slate-400 mt-1 max-w-[220px]">
          Select any subsystem unit on the 3D spacecraft model or telemetry matrix to inspect screening metrics.
        </p>
      </div>
    );
  }

  const compId = componentResult?.component_id || componentDetail?.component_id || '';
  const subsystem = componentResult?.subsystem || componentDetail?.subsystem || '';
  const lotId = componentResult?.lot_id || componentDetail?.lot_id || '';
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
    <div className="flex flex-col h-full bg-[#060D1A] border-l border-[#1E3A6E] select-none overflow-y-auto font-mono text-xs">
      {/* Intelligence Header */}
      <div className="p-3.5 border-b border-[#1E3A6E] bg-[#030712]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
              <span className="text-xs font-orbitron font-bold text-white tracking-wider">
                {compId}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 tracking-wider">
              {subsystem.toUpperCase()} • <span className="text-[#00E5FF]">{lotId}</span>
            </div>
          </div>
          <div
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border flex items-center space-x-1 ${
              decision === 'REJECT'
                ? 'bg-[#FF0055]/20 border-[#FF0055] text-[#FF0055] glow-reject animate-pulse'
                : decision === 'MONITOR'
                ? 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800] glow-monitor'
                : 'bg-[#00FF9D]/15 border-[#00FF9D] text-[#00FF9D] glow-safe'
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

      <div className="p-3.5 space-y-3 flex-1">
        {/* ISRO FLIGHT ACTION BANNER */}
        <div
          className={`p-2.5 rounded border text-xs font-mono ${
            decision === 'REJECT'
              ? 'bg-[#FF0055]/15 border-[#FF0055]/60 text-rose-200'
              : decision === 'MONITOR'
              ? 'bg-[#FFB800]/15 border-[#FFB800]/60 text-amber-200'
              : 'bg-[#00FF9D]/10 border-[#00FF9D]/50 text-emerald-200'
          }`}
        >
          <div className="font-bold flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span>
              {decision === 'REJECT'
                ? 'FLIGHT ACTION: REJECT & GROUND ISOLATION'
                : decision === 'MONITOR'
                ? 'FLIGHT ACTION: WATCHLIST RESTRICTION'
                : 'FLIGHT ACTION: FLIGHT READINESS PASS'}
            </span>
          </div>
          <div className="text-[10px] mt-1 text-slate-300">
            {decision === 'REJECT'
              ? 'Latent degradation velocity breaches specification during 250h operational horizon.'
              : decision === 'MONITOR'
              ? 'Elevated degradation slope vs lot baseline. Enhanced telemetry polling required.'
              : 'Burn-in trajectory is fully stabilized within ECSS-Q-ST-60-13C limits.'}
          </div>
        </div>

        {/* TRADITIONAL VS AI COMPARISON CARD */}
        <div className="rounded border border-[#1E3A6E] bg-[#0A1120] p-3 corner-box shadow-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-[#00E5FF]">
              <Scale className="w-3.5 h-3.5" />
              <span>DATASHEET VS AI SCREENING</span>
            </span>
            {isWithinLimit && isAnomalous && (
              <span className="text-[9px] text-[#FF0055] font-bold bg-[#FF0055]/10 px-1.5 py-0.2 rounded border border-[#FF0055]/30">
                WITHIN LIMIT ≠ FLIGHT HEALTHY
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Traditional Check */}
            <div className="p-2 rounded bg-[#030712] border border-[#162A50]">
              <span className="text-[9px] text-slate-500 block">TRADITIONAL TEST</span>
              <span
                className={`font-bold text-xs ${
                  isWithinLimit ? 'text-[#00FF9D]' : 'text-[#FF0055]'
                }`}
              >
                {isWithinLimit ? 'PASS (Inside Spec)' : 'FAIL (Exceeded)'}
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {currentVal.toFixed(1)} &lt; {limit.toFixed(1)}
              </div>
            </div>

            {/* SPACEGUARD AI Check */}
            <div className="p-2 rounded bg-[#030712] border border-[#162A50]">
              <span className="text-[9px] text-[#00E5FF] block">SPACEGUARD AI</span>
              <span
                className={`font-bold text-xs ${
                  decision === 'REJECT'
                    ? 'text-[#FF0055]'
                    : decision === 'MONITOR'
                    ? 'text-[#FFB800]'
                    : 'text-[#00FF9D]'
                }`}
              >
                {decision === 'REJECT'
                  ? 'CRITICAL LATENT'
                  : decision === 'MONITOR'
                  ? 'ELEVATED DRIFT'
                  : 'FLIGHT READY'}
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Risk: <span className="text-white font-bold">{risk.toFixed(0)}</span> / 100
              </div>
            </div>
          </div>
        </div>

        {/* RISK GAUGE & QUANTITATIVE METRICS */}
        <div className="rounded border border-[#1E3A6E] bg-[#0A1120] p-3 corner-box">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-400">ISRO COMPOSITE RISK SCORE</span>
            <span
              className={`text-base font-bold font-mono ${
                risk >= 70 ? 'text-[#FF0055]' : risk >= 35 ? 'text-[#FFB800]' : 'text-[#00FF9D]'
              }`}
            >
              {risk.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </span>
          </div>

          <div className="w-full bg-[#030712] h-2 rounded-full overflow-hidden border border-[#1E3A6E] mb-3">
            <div
              className={`h-full transition-all duration-500 ${
                risk >= 70
                  ? 'bg-[#FF0055] shadow-[0_0_10px_rgba(255,0,85,0.8)]'
                  : risk >= 35
                  ? 'bg-[#FFB800]'
                  : 'bg-[#00FF9D]'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, risk))}%` }}
            />
          </div>

          {/* 4 Quantitative Telemetry Gauges */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Anomaly Score */}
            <div className="p-2 rounded bg-[#030712] border border-[#162A50]">
              <span className="text-[9px] text-slate-500 block">ANOMALY SCORE</span>
              <span className="text-white font-bold">{(anomalyScore * 100).toFixed(0)}%</span>
              <span className="text-[9px] text-slate-400 ml-1">
                ({anomalyScore >= 0.65 ? 'High' : 'Normal'})
              </span>
            </div>

            {/* Lot Relative Deviation */}
            <div className="p-2 rounded bg-[#030712] border border-[#162A50]">
              <span className="text-[9px] text-slate-500 block">LOT Z-SCORE</span>
              <span
                className={`font-bold ${
                  Math.abs(lotZScore) >= 2.5 ? 'text-[#FF0055]' : 'text-white'
                }`}
              >
                {lotZScore >= 0 ? `+${lotZScore.toFixed(1)}` : lotZScore.toFixed(1)}σ
              </span>
              <span className="text-[9px] text-slate-400 ml-1">vs Lot Mean</span>
            </div>

            {/* Burn-in Drift Rate */}
            <div className="p-2 rounded bg-[#030712] border border-[#162A50]">
              <span className="text-[9px] text-slate-500 block">DRIFT VELOCITY</span>
              <span className="text-white font-bold">
                {driftRate >= 0 ? `+${driftRate.toFixed(4)}` : driftRate.toFixed(4)}
              </span>
              <span className="text-[9px] text-slate-400 ml-1">µA / hr</span>
            </div>

            {/* Projected 250h Value */}
            <div className="p-2 rounded bg-[#030712] border border-[#162A50]">
              <span className="text-[9px] text-slate-500 block">PROJ @250H HORIZON</span>
              <span
                className={`font-bold ${
                  predictedVal && predictedVal >= limit ? 'text-[#FF0055]' : 'text-white'
                }`}
              >
                {predictedVal !== null && predictedVal !== undefined
                  ? predictedVal.toFixed(1)
                  : 'N/A'}
              </span>
              <span className="text-[9px] text-[#FF0055] ml-1">
                {predictedVal && predictedVal >= limit ? 'BREACH' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* AI Explanatory Diagnosis */}
        <div className="rounded border border-[#1E3A6E] bg-[#0A1120] p-3 corner-box">
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-[#00E5FF] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00FF9D]" />
            <span>AI RELIABILITY SCREENING DIAGNOSIS</span>
          </div>

          <div className="text-[11px] font-mono text-slate-200 whitespace-pre-line leading-relaxed bg-[#030712] p-2.5 rounded border border-[#162A50]">
            {explanation}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[#00E5FF]" />
              <span>Confidence: {predConfidence}</span>
            </span>
            <span className="text-[#00FF9D]">ISRO Ensemble v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
