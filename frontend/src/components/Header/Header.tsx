import React from 'react';
import { Rocket, Upload, Play, FileText, Sparkles, RefreshCw } from 'lucide-react';
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
  return (
    <header className="h-16 bg-space-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 select-none z-20">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyber-blue to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(2,132,199,0.5)]">
          <div className="w-full h-full bg-space-950 rounded-[7px] flex items-center justify-center">
            <Rocket className="w-5 h-5 text-cyber-cyan transform -rotate-45" />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold tracking-wider text-white font-mono">
              SPACEGUARD <span className="text-cyber-cyan font-extrabold">AI</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
              SIH 2026
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
            Real-Time Intelligent Reliability Monitoring for Spacecraft Components
          </p>
        </div>
      </div>

      {/* Middle: Live Health Status Badges */}
      <div className="hidden md:flex">
        <HealthIndicators missionStatus={missionStatus} />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2.5">
        {/* MISSION DEMO - 1-Click Fast-Track */}
        <button
          onClick={onRunDemo}
          disabled={isAnalyzing}
          className="relative group overflow-hidden px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-900/30 transition flex items-center space-x-1.5 disabled:opacity-50"
          title="Load pre-configured aerospace burn-in demo dataset and execute screening"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-spin" style={{ animationDuration: '4s' }} />
          <span>MISSION DEMO</span>
        </button>

        {/* Upload Dataset */}
        <button
          onClick={onOpenUpload}
          disabled={isAnalyzing}
          className="px-3 py-1.5 rounded-md bg-space-800 hover:bg-space-750 text-slate-200 hover:text-white font-mono text-xs border border-slate-700 transition flex items-center space-x-1.5 disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">UPLOAD</span>
        </button>

        {/* Run Screening */}
        <button
          onClick={onRunScreening}
          disabled={isAnalyzing || !hasActiveDataset}
          className="px-3 py-1.5 rounded-md bg-emerald-600/90 hover:bg-emerald-500 text-white font-mono text-xs font-medium border border-emerald-400/40 shadow-sm transition flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          title={hasActiveDataset ? "Run AI Screening on active dataset" : "Upload or select a dataset first"}
        >
          {isAnalyzing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isAnalyzing ? 'SCREENING...' : 'RUN AI'}</span>
        </button>

        {/* Reports & Audit */}
        <button
          onClick={onOpenReports}
          className="px-3 py-1.5 rounded-md bg-space-800 hover:bg-space-750 text-slate-300 hover:text-white font-mono text-xs border border-slate-700 transition flex items-center space-x-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">REPORTS</span>
        </button>
      </div>
    </header>
  );
};
