import React from 'react';
import { Radio, Satellite, Cpu, AlertTriangle, ArrowRight, Activity, ShieldCheck, ShieldAlert, Wifi, Globe } from 'lucide-react';
import { MissionStatusResponse } from '../../types';

interface MissionSimulationMapProps {
  missionStatus?: MissionStatusResponse | null;
}

export const MissionSimulationMap: React.FC<MissionSimulationMapProps> = ({ missionStatus }) => {
  const hasCriticalAnomaly = (missionStatus?.summary.reject || 0) > 0;
  const healthScore = missionStatus?.mission_health_score ?? 100;

  return (
    <div className="flex flex-col h-full p-2.5 select-none justify-center font-mono text-xs">
      {/* Top Banner Disclaimer */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#00E5FF]">
          <Globe className="w-3.5 h-3.5 text-[#00FF9D]" />
          <span className="font-orbitron tracking-wider">ISRO ISTRAC // SPACE-GROUND TELEMETRY ARCHITECTURE</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#101F3C] border border-[#1E3A6E] text-[10px] text-[#00FF9D]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping" />
          <span>REAL-TIME DSN TRACKING ACTIVE</span>
        </div>
      </div>

      {/* Animated Flow Nodes */}
      <div className="grid grid-cols-4 gap-2.5 items-center">
        {/* Node 1: ISTRAC Ground Network */}
        <div className="p-3 rounded bg-[#060D1A] border border-[#1E3A6E] flex flex-col justify-between h-28 corner-box">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>GROUND NETWORK</span>
            <Radio className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block font-orbitron">
              ISTRAC BLR-01
            </span>
            <span className="text-[10px] text-slate-400">
              32m Deep Space Antenna (Byalalu)
            </span>
          </div>
          <div className="text-[10px] text-[#00FF9D] flex items-center space-x-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]" />
            <span>S/X-BAND LOCKED (AZ 142°, EL 54°)</span>
          </div>
        </div>

        {/* Node 2: Telemetry Link Stream */}
        <div className="p-3 rounded bg-[#060D1A] border border-[#1E3A6E] flex flex-col justify-between h-28 corner-box">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>TELEMETRY LINK</span>
            <Activity className="w-3.5 h-3.5 text-[#00FF9D] animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-white block font-orbitron">
              CCSDS TELEMETRY
            </span>
            <span className="text-[10px] text-slate-400">
              Downlink: 150 Mbps (SNR 24.8 dB)
            </span>
          </div>
          <div className="text-[10px] text-[#00E5FF] flex items-center space-x-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
            <span>BER: &lt; 1e-9 VITERBI LOCK</span>
          </div>
        </div>

        {/* Node 3: Spacecraft Subsystem Bus */}
        <div className="p-3 rounded bg-[#060D1A] border border-[#1E3A6E] flex flex-col justify-between h-28 corner-box">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>SPACECRAFT BUS</span>
            <Satellite className="w-3.5 h-3.5 text-[#FFB800]" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block font-orbitron">
              EOS-08 // ISRO
            </span>
            <span className="text-[10px] text-slate-400">
              Sun-Synchronous 541 km (97.45°)
            </span>
          </div>
          <div className="text-[10px]">
            {hasCriticalAnomaly ? (
              <span className="text-[#FF0055] font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF0055] animate-pulse" />
                <span>LATENT DEGRADATION DETECTED</span>
              </span>
            ) : (
              <span className="text-[#00FF9D] font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]" />
                <span>ALL SUBSYSTEMS NOMINAL</span>
              </span>
            )}
          </div>
        </div>

        {/* Node 4: AI Reliability Engine */}
        <div
          className={`p-3 rounded border flex flex-col justify-between h-28 transition corner-box ${
            hasCriticalAnomaly
              ? 'bg-[#060D1A] border-[#FF0055] shadow-[0_0_15px_rgba(255,0,85,0.3)]'
              : 'bg-[#060D1A] border-[#1E3A6E]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>RELIABILITY ENGINE</span>
            <Cpu className={`w-3.5 h-3.5 ${hasCriticalAnomaly ? 'text-[#FF0055] animate-pulse' : 'text-[#00E5FF]'}`} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block font-orbitron">
              SPACEGUARD AI CORE
            </span>
            <span className="text-[10px] text-slate-300">
              Mission Reliability: <span className="text-white font-bold">{healthScore.toFixed(0)}%</span>
            </span>
          </div>
          <div className="text-[10px]">
            {hasCriticalAnomaly ? (
              <span className="text-[#FF0055] font-bold flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>CRITICAL ACTION REQUIRED</span>
              </span>
            ) : (
              <span className="text-[#00FF9D] font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ALL LOT TRAJECTORIES SAFE</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
