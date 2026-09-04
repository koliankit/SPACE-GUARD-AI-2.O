import React, { useState } from 'react';
import { Clock, ArrowRight, Activity } from 'lucide-react';
import { ComponentDetail, ComponentResult } from '../../types';

interface BurnInTimelineProps {
  componentDetail?: ComponentDetail | null;
  componentResult?: ComponentResult | null;
}

export const BurnInTimeline: React.FC<BurnInTimelineProps> = ({
  componentDetail,
  componentResult,
}) => {
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const measurements = componentDetail?.measurements || [];
  const baseline = measurements[0]?.value || 0;

  if (measurements.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs font-mono text-slate-500">
        No burn-in stage measurements recorded for this component.
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center h-full p-2 select-none font-share">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[11px] font-mono text-slate-300 flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="tracking-wider">ISRO/PAS-102 EEE BURN-IN DRIFT SEQUENCE (0h → 168h MIL-STD-883)</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500">
          SELECT STAGE GATEWAY FOR PARAMETRIC RESIDUAL ANALYSIS
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {measurements.map((m, idx) => {
          const deltaFromBaseline = m.value - baseline;
          const pctDelta = baseline !== 0 ? (deltaFromBaseline / baseline) * 100 : 0;
          const isSelected = activeStage === m.stage || (activeStage === null && idx === measurements.length - 1);
          const limit = m.datasheet_limit || 50;
          const isBreached = m.value >= limit;

          return (
            <div
              key={m.stage}
              onClick={() => setActiveStage(m.stage)}
              className={`p-2.5 rounded border transition cursor-pointer flex flex-col justify-between corner-box ${
                isSelected
                  ? 'bg-[#00E5FF]/10 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                  : 'bg-[#030712]/80 border-[#1E293B] hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-[#00E5FF] tracking-wider">{m.stage}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-widest ${
                    isBreached
                      ? 'bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/40'
                      : 'bg-[#00FF9D]/15 text-[#00FF9D] border border-[#00FF9D]/30'
                  }`}
                >
                  {isBreached ? 'SPEC BREACH' : 'NOMINAL'}
                </span>
              </div>

              <div className="my-1.5 flex items-baseline">
                <span className="text-lg font-bold font-mono text-white tracking-tight">
                  {m.value.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 ml-1.5 font-mono">
                  / {limit.toFixed(0)} MAX
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono border-t border-[#1E293B] pt-1.5 text-slate-400">
                <span className="text-slate-500">Δ 0h DRIFT:</span>
                <span
                  className={`font-bold ${
                    deltaFromBaseline > 0
                      ? 'text-[#FFB800]'
                      : deltaFromBaseline < 0
                      ? 'text-[#00E5FF]'
                      : 'text-slate-400'
                  }`}
                >
                  {deltaFromBaseline >= 0 ? `+${deltaFromBaseline.toFixed(2)}` : deltaFromBaseline.toFixed(2)}
                  {' '}({pctDelta >= 0 ? `+${pctDelta.toFixed(1)}%` : `${pctDelta.toFixed(1)}%`})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
