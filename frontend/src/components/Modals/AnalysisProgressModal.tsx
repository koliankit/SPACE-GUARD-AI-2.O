import React from 'react';
import { Cpu, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  activeStageIndex: number;
}

const STAGES = [
  'DATA INGESTION',
  'PREPROCESSING & NORMALIZATION',
  'FEATURE EXTRACTION & KINETICS',
  'LOT-RELATIVE STATISTICAL ANALYSIS',
  'ISOLATION FOREST ANOMALY DETECTION',
  'DRIFT TRAJECTORY PREDICTION',
  'DETERMINISTIC RISK SCORING',
  '3D SATELLITE COMPONENT LOCALIZATION',
  'SCREENING DECISION EVALUATION',
];

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  activeStageIndex,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-space-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-5 select-none animate-fadeIn">
        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-800 pb-3">
          <div className="p-1.5 rounded-lg bg-cyber-blue/20 border border-cyber-cyan/40 text-cyber-cyan">
            <Cpu className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white tracking-wide">
              AI SCREENING ENGINE RUNNING
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Processing burn-in dataset through full ML pipeline
            </span>
          </div>
        </div>

        {/* Pipeline Stage Sequence */}
        <div className="space-y-2 font-mono text-xs mb-4">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeStageIndex;
            const isCurrent = idx === activeStageIndex;
            return (
              <div
                key={stage}
                className={`flex items-center space-x-2.5 px-3 py-1.5 rounded transition ${
                  isCurrent
                    ? 'bg-cyber-blue/15 border border-cyber-cyan/40 text-white font-bold'
                    : isCompleted
                    ? 'bg-space-950/60 text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-cyber-cyan animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className="text-[11px] truncate">{stage}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom Progress Bar */}
        <div className="w-full bg-space-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyber-cyan transition-all duration-300"
            style={{ width: `${Math.min(100, ((activeStageIndex + 1) / STAGES.length) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
