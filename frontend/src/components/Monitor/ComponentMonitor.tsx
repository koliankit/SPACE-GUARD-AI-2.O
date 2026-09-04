import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertOctagon, AlertTriangle, CheckCircle2, SlidersHorizontal, Crosshair, Radio } from 'lucide-react';
import { ComponentSummary, DecisionType } from '../../types';

interface ComponentMonitorProps {
  components: ComponentSummary[];
  selectedComponentId?: string | null;
  onSelectComponent: (componentId: string) => void;
  isLoading?: boolean;
}

export const ComponentMonitor: React.FC<ComponentMonitorProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | DecisionType>('ALL');
  const [subsystemFilter, setSubsystemFilter] = useState<string>('ALL');

  // Distinct subsystems
  const subsystems = useMemo(() => {
    const set = new Set<string>();
    components.forEach((c) => set.add(c.subsystem));
    return ['ALL', ...Array.from(set)];
  }, [components]);

  // Filtered components
  const filteredComponents = useMemo(() => {
    return components.filter((comp) => {
      const matchesSearch =
        comp.component_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.lot_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.subsystem.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDecision =
        activeFilter === 'ALL' || comp.decision === activeFilter;

      const matchesSubsystem =
        subsystemFilter === 'ALL' || comp.subsystem === subsystemFilter;

      return matchesSearch && matchesDecision && matchesSubsystem;
    });
  }, [components, searchTerm, activeFilter, subsystemFilter]);

  // Counts for pills
  const counts = useMemo(() => {
    return {
      all: components.length,
      safe: components.filter((c) => c.decision === 'SAFE').length,
      monitor: components.filter((c) => c.decision === 'MONITOR').length,
      reject: components.filter((c) => c.decision === 'REJECT').length,
    };
  }, [components]);

  const getDecisionBadge = (decision: DecisionType) => {
    switch (decision) {
      case 'REJECT':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/50 animate-pulse glow-reject">
            <AlertOctagon className="w-2.5 h-2.5" />
            <span>REJECT</span>
          </span>
        );
      case 'MONITOR':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/50 glow-monitor">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>MONITOR</span>
          </span>
        );
      case 'SAFE':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/30">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>SAFE</span>
          </span>
        );
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-[#FF0055]';
    if (risk >= 35) return 'text-[#FFB800]';
    return 'text-[#00FF9D]';
  };

  return (
    <div className="flex flex-col h-full bg-[#060D1A] border-r border-[#1E3A6E] select-none font-mono text-xs">
      {/* Panel Header */}
      <div className="p-3 border-b border-[#1E3A6E] bg-[#030712]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <Crosshair className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
            <span className="text-xs font-orbitron font-bold tracking-wider text-white uppercase">
              SUBSYSTEM TELEMETRY
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#101F3C] text-[#00E5FF] border border-[#1E3A6E]">
            {filteredComponents.length} / {components.length} UNITS
          </span>
        </div>

        {/* Search Input */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="SCAN ID, LOT, SUBSYSTEM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#0A1120] border border-[#1E3A6E] rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] font-mono tracking-wider"
          />
        </div>

        {/* Tactical Filter Pills */}
        <div className="grid grid-cols-4 gap-1 text-[10px] font-mono font-bold">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`py-1 rounded text-center transition cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-[#1E3A6E] text-white border border-[#00E5FF]/60 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                : 'bg-[#0A1120] text-slate-400 hover:text-white border border-[#162A50]'
            }`}
          >
            ALL ({counts.all})
          </button>
          <button
            onClick={() => setActiveFilter('SAFE')}
            className={`py-1 rounded text-center transition cursor-pointer ${
              activeFilter === 'SAFE'
                ? 'bg-[#00FF9D]/20 text-[#00FF9D] border border-[#00FF9D]'
                : 'bg-[#0A1120] text-slate-400 hover:text-[#00FF9D] border border-[#162A50]'
            }`}
          >
            SAFE ({counts.safe})
          </button>
          <button
            onClick={() => setActiveFilter('MONITOR')}
            className={`py-1 rounded text-center transition cursor-pointer ${
              activeFilter === 'MONITOR'
                ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]'
                : 'bg-[#0A1120] text-slate-400 hover:text-[#FFB800] border border-[#162A50]'
            }`}
          >
            WARN ({counts.monitor})
          </button>
          <button
            onClick={() => setActiveFilter('REJECT')}
            className={`py-1 rounded text-center transition cursor-pointer ${
              activeFilter === 'REJECT'
                ? 'bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055] animate-pulse'
                : 'bg-[#0A1120] text-slate-400 hover:text-[#FF0055] border border-[#162A50]'
            }`}
          >
            FAIL ({counts.reject})
          </button>
        </div>

        {/* Subsystem Selector */}
        {subsystems.length > 2 && (
          <div className="mt-2 flex items-center space-x-1 text-xs text-slate-400">
            <SlidersHorizontal className="w-3 h-3 text-[#00E5FF]" />
            <select
              value={subsystemFilter}
              onChange={(e) => setSubsystemFilter(e.target.value)}
              className="bg-[#0A1120] border border-[#1E3A6E] rounded px-2 py-1 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-[#00E5FF] w-full"
            >
              {subsystems.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === 'ALL' ? 'ALL FLIGHT SUBSYSTEMS' : sub.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Component Telemetry Stream Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#162A50]/60">
        {isLoading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 animate-pulse">
            SCANNING TELEMETRY TELEMETRY BUS...
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            NO SUBSYSTEMS FOUND.
          </div>
        ) : (
          filteredComponents.map((comp, idx) => {
            const isSelected = selectedComponentId === comp.component_id;
            const hexAddr = '0x' + (1000 + idx * 47).toString(16).toUpperCase();
            return (
              <div
                key={comp.component_id}
                onClick={() => onSelectComponent(comp.component_id)}
                className={`p-2.5 transition cursor-pointer flex flex-col space-y-1 hover:bg-[#0B1528] ${
                  isSelected
                    ? 'bg-[#101F3C] border-l-4 border-[#00E5FF] shadow-[inset_0_0_12px_rgba(0,229,255,0.15)]'
                    : 'border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-500 font-mono">[{hexAddr}]</span>
                    <span className="font-mono text-xs font-bold text-white tracking-wide">
                      {comp.component_id}
                    </span>
                  </div>
                  {getDecisionBadge(comp.decision)}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="truncate max-w-[140px] text-slate-300">{comp.subsystem}</span>
                  <span className="text-[#00E5FF]">{comp.lot_id}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
                  <span className="text-slate-500">
                    DEGRADATION RISK:
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-14 bg-[#030712] h-1.5 rounded-full overflow-hidden border border-[#1E3A6E]">
                      <div
                        className={`h-full ${
                          comp.risk_score >= 70
                            ? 'bg-[#FF0055]'
                            : comp.risk_score >= 35
                            ? 'bg-[#FFB800]'
                            : 'bg-[#00FF9D]'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(6, comp.risk_score))}%` }}
                      />
                    </div>
                    <span className={`font-bold font-mono ${getRiskColor(comp.risk_score)}`}>
                      {comp.risk_score.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
