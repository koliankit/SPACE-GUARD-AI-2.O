import React from 'react';
import { Radio, Satellite, Cpu, AlertTriangle, ArrowRight, Activity, ShieldCheck, ShieldAlert } from 'lucide-react';
import { MissionStatusResponse } from '../../types';

interface MissionSimulationMapProps {
  missionStatus?: MissionStatusResponse | null;
}

export const MissionSimulationMap: React.FC<MissionSimulationMapProps> = ({ missionStatus }) => {
  const hasCriticalAnomaly = (missionStatus?.summary.reject || 0) > 0;
  const healthScore = missionStatus?.mission_health_score ?? 100;

  return (
    <div className="flex flex-col h-full p-2 select-none justify-center">
      {/* Top Banner Disclaimer */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-300">
          <Activity className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>SPACE-GROUND TELEMETRY ARCHITECTURE</span>
        </div>
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono">
          <AlertTriangle className="w-3 h-3" />
          <span>MISSION SIMULATION</span>
        </div>
      </div>

      {/* Animated Flow Nodes */}
      <div className="grid grid-cols-4 gap-2 items-center">
        {/* Node 1: Ground Station (ISTRAC / Bengaluru Inspired Simulation) */}
        <div className="p-2.5 rounded-lg bg-space-950 border border-slate-800 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>GROUND STATION</span>
            <Radio className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-white block">
              ISTRAC SIM-NET
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              32m Deep Space Antenna
            </span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>LINK LOCKED (8.4 GHz)</span>
          </div>
        </div>

        {/* Node 2: Telemetry Link Stream */}
        <div className="p-2.5 rounded-lg bg-space-950 border border-slate-800 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>TELEMETRY STREAM</span>
            <Activity className="w-3.5 h-3.5 text-cyber-cyan animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-mono font-bold text-white block">
              CCSDS TELEMETRY
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Frame Rate: 128 kbps
            </span>
          </div>
          <div className="text-[10px] font-mono text-cyber-cyan flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-ping" />
            <span>REAL-TIME INGESTION</span>
          </div>
        </div>

        {/* Node 3: Spacecraft Subsystem Bus */}
        <div className="p-2.5 rounded-lg bg-space-950 border border-slate-800 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>SPACECRAFT BUS</span>
            <Satellite className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-white block">
              SPACEGUARD-01
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Sun-Synchronous Orbit (500km)
            </span>
          </div>
          <div className="text-[10px] font-mono flex items-center space-x-1">
            {hasCriticalAnomaly ? (
              <span className="text-rose-400 font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>ANOMALY TELEMETRY ACTIVE</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>ALL SUBSYSTEMS NOMINAL</span>
              </span>
            )}
          </div>
        </div>

        {/* Node 4: AI Reliability Engine */}
        <div
          className={`p-2.5 rounded-lg border flex flex-col justify-between h-24 transition ${
            hasCriticalAnomaly
              ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              : 'bg-space-950 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>RELIABILITY ENGINE</span>
            <Cpu className={`w-3.5 h-3.5 ${hasCriticalAnomaly ? 'text-rose-400 animate-pulse' : 'text-cyber-cyan'}`} />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-white block">
              SPACEGUARD AI CORE
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Mission Health: <span className="text-white font-bold">{healthScore.toFixed(0)}%</span>
            </span>
          </div>
          <div className="text-[10px] font-mono">
            {hasCriticalAnomaly ? (
              <span className="text-rose-400 font-bold flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3" />
                <span>ALERT: 3D LOCALIZATION</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>NO ANOMALIES FLAGGED</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
