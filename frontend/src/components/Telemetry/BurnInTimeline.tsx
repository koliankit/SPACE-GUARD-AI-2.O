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
    <div className="flex flex-col justify-center h-full p-2 select-none">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
          <Clock className="w-3 h-3 text-cyber-cyan" />
          <span>BURN-IN STAGE TIME SEQUENCE (0h → 168h)</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500">
          Click milestone to inspect stage delta
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
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
              className={`p-2 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-space-800 border-cyber-cyan/60 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : 'bg-space-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-cyber-cyan">{m.stage}</span>
                <span
                  className={`text-[10px] font-mono ${
                    isBreached ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {isBreached ? 'OVER LIMIT' : 'NOMINAL'}
                </span>
              </div>

              <div className="my-1">
                <span className="text-base font-bold font-mono text-white tracking-tight">
                  {m.value.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">
                  / {limit.toFixed(0)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-800/80 pt-1 text-slate-400">
                <span>Δ 0h:</span>
                <span
                  className={`font-semibold ${
                    deltaFromBaseline > 0
                      ? 'text-amber-400'
                      : deltaFromBaseline < 0
                      ? 'text-cyber-cyan'
                      : 'text-slate-400'
                  }`}
                >
                  {deltaFromBaseline >= 0 ? `+${deltaFromBaseline.toFixed(2)}` : deltaFromBaseline.toFixed(2)}
                  {' '}({pctDelta >= 0 ? `+${pctDelta.toFixed(0)}%` : `${pctDelta.toFixed(0)}%`})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
