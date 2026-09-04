import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Upload,
  Play,
  FileText,
  Sparkles,
  RefreshCw,
  Maximize,
  Minimize,
  Radio,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { HealthIndicators } from './HealthIndicators';
import { MissionStatusResponse } from '../../types';

interface HeaderProps {
  missionStatus?: MissionStatusResponse | null;
  onOpenUpload: () => void;
  onRunDemo: () => void;
  onRunScreening: () => void;
  onOpenReports: () => void;
  isAnalyzing?: boolean;
  hasActiveDataset?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  missionStatus,
  onOpenUpload,
  onRunDemo,
  onRunScreening,
  onOpenReports,
  isAnalyzing = false,
  hasActiveDataset = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clock, setClock] = useState({
    ist: '',
    utc: '',
    met: '',
  });

  // Real-time ticking mission clocks (IST, UTC, MET)
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      // IST: UTC + 5:30
      const istStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
      });
      // UTC
      const utcStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'UTC',
        hour12: false,
      });
      // MET: arbitrary simulated mission elapsed counter
      const startOfDay = new Date(now.getFullYear(), 0, 1).getTime();
      const diffSec = Math.floor((now.getTime() - startOfDay) / 1000);
      const days = Math.floor(diffSec / 86400);
      const hours = String(Math.floor((diffSec % 86400) / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
      const secs = String(diffSec % 60).padStart(2, '0');

      setClock({
        ist: istStr,
        utc: utcStr,
        met: `+${days}d ${hours}:${mins}:${secs}`,
      });
    };

    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="h-16 bg-[#030712] border-b border-[#1E3A6E] px-4 flex items-center justify-between shrink-0 select-none z-30 font-mono shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      {/* Brand & ISRO Mission Identification */}
      <div className="flex items-center space-x-3.5">
        {/* ISRO Tricolor Emblem Badge */}
        <div className="relative w-10 h-10 rounded bg-[#060D1A] border border-[#1E3A6E] p-1 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.25)]">
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00FF9D] animate-ping" />
          <Rocket className="w-5 h-5 text-[#00E5FF] transform -rotate-45" />
          {/* Subtle tricolor marker */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 flex">
            <div className="w-1/3 h-full bg-[#FF7700]" />
            <div className="w-1/3 h-full bg-white" />
            <div className="w-1/3 h-full bg-[#00FF9D]" />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold tracking-widest text-white font-orbitron">
              ISRO <span className="text-[#00E5FF]">SPACEGUARD</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#060D1A] text-[#00FF9D] font-mono border border-[#00FF9D]/40 font-bold tracking-wider">
              SDSC SHAR // MCC
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-wider leading-tight hidden sm:block">
            SATISH DHAWAN SPACE CENTRE • ISTRAC BENGALURU TELEMETRY NETWORK
          </p>
        </div>
      </div>

      {/* Middle: Real-Time ISRO Mission Clocks & Health Status */}
      <div className="hidden lg:flex items-center space-x-4 bg-[#060D1A] px-3.5 py-1.5 rounded border border-[#162A50] shadow-inner text-xs">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="text-[10px] text-slate-400 uppercase">IST:</span>
          <span className="font-bold text-white tracking-wider">{clock.ist || '00:00:00'}</span>
        </div>

        <div className="w-[1px] h-3.5 bg-[#1E3A6E]" />

        <div className="flex items-center space-x-1.5 text-slate-300">
          <span className="text-[10px] text-slate-400 uppercase">UTC:</span>
          <span className="font-semibold text-slate-200 tracking-wider">{clock.utc || '00:00:00'}</span>
        </div>

        <div className="w-[1px] h-3.5 bg-[#1E3A6E]" />

        <div className="flex items-center space-x-1.5 text-slate-300">
          <Radio className="w-3 h-3 text-[#00FF9D] animate-pulse" />
          <span className="text-[10px] text-slate-400 uppercase">MET:</span>
          <span className="font-bold text-[#00FF9D] tracking-wider">{clock.met || '+000d 00:00:00'}</span>
        </div>

        <div className="w-[1px] h-3.5 bg-[#1E3A6E]" />

        <div className="flex items-center space-x-1 text-[10px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]" />
          <span className="text-slate-300 font-bold">CARRIER LOCK</span>
        </div>
      </div>

      {/* Action Buttons & Fullscreen Toggle */}
      <div className="flex items-center space-x-2">
        {/* MISSION DEMO Fast-Track */}
        <button
          onClick={onRunDemo}
          disabled={isAnalyzing}
          className="relative group px-3 py-1.5 rounded bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 hover:from-blue-600 hover:to-emerald-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)] transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          title="Load pre-configured ISRO aerospace burn-in telemetry dataset"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="tracking-wider">MISSION DEMO</span>
        </button>

        {/* Upload Telemetry */}
        <button
          onClick={onOpenUpload}
          disabled={isAnalyzing}
          className="px-2.5 py-1.5 rounded bg-[#060D1A] hover:bg-[#101F3C] text-slate-200 hover:text-white font-mono text-xs border border-[#1E3A6E] transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline tracking-wider">INGEST</span>
        </button>

        {/* Run Screening */}
        <button
          onClick={onRunScreening}
          disabled={isAnalyzing || !hasActiveDataset}
          className="px-3 py-1.5 rounded bg-[#00FF9D]/90 hover:bg-[#00FF9D] text-black font-mono text-xs font-bold border border-[#00FF9D] shadow-[0_0_12px_rgba(0,255,157,0.4)] transition flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title={hasActiveDataset ? 'Execute ML Anomaly Screening on active dataset' : 'Ingest telemetry dataset first'}
        >
          {isAnalyzing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span className="tracking-wider">{isAnalyzing ? 'SCREENING...' : 'RUN AI'}</span>
        </button>

        {/* Reports */}
        <button
          onClick={onOpenReports}
          className="px-2.5 py-1.5 rounded bg-[#060D1A] hover:bg-[#101F3C] text-slate-300 hover:text-white font-mono text-xs border border-[#1E3A6E] transition flex items-center space-x-1.5 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline tracking-wider">REPORTS</span>
        </button>

        {/* Fullscreen Toggle (Sriharikota Command Display Mode) */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded bg-[#060D1A] hover:bg-[#101F3C] text-[#00E5FF] hover:text-white border border-[#1E3A6E] transition cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Full Screen Mission Control Mode'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
