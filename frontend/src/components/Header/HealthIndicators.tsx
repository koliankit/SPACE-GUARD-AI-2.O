import React from 'react';
import { ShieldCheck, Database, Cpu, Radio, AlertTriangle } from 'lucide-react';
import { MissionStatusResponse } from '../../types';

interface HealthIndicatorsProps {
  missionStatus?: MissionStatusResponse | null;
  isLoading?: boolean;
}

export const HealthIndicators: React.FC<HealthIndicatorsProps> = ({ missionStatus }) => {
  const isSysOnline = missionStatus?.system_online ?? true;
  const isDbOnline = missionStatus?.database_online ?? true;
  const isAiOnline = missionStatus?.ai_engine_online ?? true;
  const isStreamActive = missionStatus?.data_stream_active ?? false;

  return (
    <div className="flex items-center space-x-3 text-xs font-mono">
      {/* System Status */}
      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-space-850 border border-slate-800">
        <div className={`w-2 h-2 rounded-full ${isSysOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500'}`} />
        <span className={isSysOnline ? 'text-slate-300' : 'text-rose-400 font-bold'}>
          {isSysOnline ? 'SYSTEM ONLINE' : 'SYS OFFLINE'}
        </span>
      </div>

      {/* AI ML Engine */}
      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-space-850 border border-slate-800">
        <Cpu className={`w-3.5 h-3.5 ${isAiOnline ? 'text-cyber-cyan' : 'text-rose-500'}`} />
        <span className={isAiOnline ? 'text-slate-300' : 'text-rose-400'}>
          {isAiOnline ? 'AI ENGINE ONLINE' : 'AI OFFLINE'}
        </span>
      </div>

      {/* Relational Database */}
      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-space-850 border border-slate-800">
        <Database className={`w-3.5 h-3.5 ${isDbOnline ? 'text-emerald-400' : 'text-rose-500'}`} />
        <span className={isDbOnline ? 'text-slate-300' : 'text-rose-400'}>
          {isDbOnline ? 'DATABASE ONLINE' : 'DB OFFLINE'}
        </span>
      </div>

      {/* Live Stream Telemetry Link */}
      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-space-850 border border-slate-800">
        <Radio className={`w-3.5 h-3.5 ${isStreamActive ? 'text-cyber-cyan animate-pulse' : 'text-slate-500'}`} />
        <span className={isStreamActive ? 'text-cyber-cyan font-medium' : 'text-slate-500'}>
          {isStreamActive ? 'TELEMETRY ACTIVE' : 'STREAM STANDBY'}
        </span>
      </div>

      {/* Mission Simulation Pill */}
      <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px]">
        <AlertTriangle className="w-3 h-3" />
        <span>MISSION SIMULATION</span>
      </div>
    </div>
  );
};
