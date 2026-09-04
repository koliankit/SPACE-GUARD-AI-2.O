import React from 'react';
import { Cpu, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  activeStageIndex: number;
}

const STAGES = [
  'TELEMETRY PACKET INGESTION (CCSDS FORMAT)',
  'ADC SENSOR PREPROCESSING & NORMALIZATION',
  'KINETIC DRIFT VELOCITY FEATURE EXTRACTION',
  'LOT-RELATIVE GAUSSIAN MAHALANOBIS COVARIANCE',
  'ISOLATION FOREST LATENT ANOMALY DETECTION',
  'EXPONENTIAL ARRHENIUS DEGRADATION TRAJECTORY',
  'DETERMINISTIC SPACE-GRADE RISK SCORING',
  '3D SATELLITE SUBSYSTEM FAULT LOCALIZATION',
  'ISRO MISSION FLIGHT DECISION MATRIX GENERATION',
];

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  activeStageIndex,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-share">
      <div className="bg-[#040914] border border-[#00E5FF]/40 rounded-lg shadow-[0_0_50px_rgba(0,229,255,0.2)] w-full max-w-lg overflow-hidden p-6 select-none animate-fadeIn corner-box relative">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 border-b border-[#1E293B] pb-3">
          <div className="p-2 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF]">
            <Cpu className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white tracking-widest flex items-center space-x-2">
              <span>ISRO-AI FLIGHT SCREENING ENGINE ACTIVE</span>
            </h3>
            <span className="text-[11px] font-mono text-[#00E5FF]/80">
              SHAR-MOC TELEMETRY BATCH RUN // ALGORITHM EXECUTION
            </span>
          </div>
        </div>

        {/* Pipeline Stage Sequence */}
        <div className="space-y-1.5 font-mono text-xs mb-5">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeStageIndex;
            const isCurrent = idx === activeStageIndex;
            return (
              <div
                key={stage}
                className={`flex items-center space-x-2.5 px-3 py-1.5 rounded transition border ${
                  isCurrent
                    ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                    : isCompleted
                    ? 'bg-[#030712] border-[#1E293B] text-slate-300'
                    : 'border-transparent text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF9D] shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#00E5FF] animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className="text-[11px] truncate tracking-wider">{stage}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>PROCESSING STAGE [{activeStageIndex + 1}/{STAGES.length}]</span>
            <span className="text-[#00E5FF] font-bold">
              {Math.min(100, Math.round(((activeStageIndex + 1) / STAGES.length) * 100))}%
            </span>
          </div>
          <div className="w-full bg-[#030712] h-2 rounded overflow-hidden border border-[#1E293B]">
            <div
              className="h-full bg-gradient-to-r from-[#00E5FF] to-[#00FF9D] transition-all duration-300 shadow-[0_0_10px_rgba(0,255,157,0.5)]"
              style={{ width: `${Math.min(100, ((activeStageIndex + 1) / STAGES.length) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
