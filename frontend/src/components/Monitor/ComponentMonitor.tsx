import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertOctagon, AlertTriangle, CheckCircle2, SlidersHorizontal } from 'lucide-react';
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
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <AlertOctagon className="w-2.5 h-2.5" />
            <span>REJECT</span>
          </span>
        );
      case 'MONITOR':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>MONITOR</span>
          </span>
        );
      case 'SAFE':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>SAFE</span>
          </span>
        );
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-rose-400';
    if (risk >= 35) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="flex flex-col h-full bg-space-900 border-r border-slate-800 select-none">
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            Component Monitor
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {filteredComponents.length} / {components.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ID, Lot, Subsystem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-space-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyber-cyan font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`py-1 rounded text-center transition ${
              activeFilter === 'ALL'
                ? 'bg-space-700 text-white font-bold border border-slate-600'
                : 'bg-space-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL ({counts.all})
          </button>
          <button
            onClick={() => setActiveFilter('SAFE')}
            className={`py-1 rounded text-center transition ${
              activeFilter === 'SAFE'
                ? 'bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-500/50'
                : 'bg-space-950 text-slate-400 hover:text-emerald-400'
            }`}
          >
            SAFE ({counts.safe})
          </button>
          <button
            onClick={() => setActiveFilter('MONITOR')}
            className={`py-1 rounded text-center transition ${
              activeFilter === 'MONITOR'
                ? 'bg-amber-950/60 text-amber-400 font-bold border border-amber-500/50'
                : 'bg-space-950 text-slate-400 hover:text-amber-400'
            }`}
          >
            MON ({counts.monitor})
          </button>
          <button
            onClick={() => setActiveFilter('REJECT')}
            className={`py-1 rounded text-center transition ${
              activeFilter === 'REJECT'
                ? 'bg-rose-950/60 text-rose-400 font-bold border border-rose-500/50'
                : 'bg-space-950 text-slate-400 hover:text-rose-400'
            }`}
          >
            REJ ({counts.reject})
          </button>
        </div>

        {/* Subsystem Dropdown */}
        {subsystems.length > 2 && (
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
            <SlidersHorizontal className="w-3 h-3 text-slate-500" />
            <select
              value={subsystemFilter}
              onChange={(e) => setSubsystemFilter(e.target.value)}
              className="bg-space-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-cyber-cyan w-full"
            >
              {subsystems.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === 'ALL' ? 'All Subsystems' : sub}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {isLoading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 animate-pulse">
            Querying component reliability records...
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            No components match active criteria.
          </div>
        ) : (
          filteredComponents.map((comp) => {
            const isSelected = selectedComponentId === comp.component_id;
            return (
              <div
                key={comp.component_id}
                onClick={() => onSelectComponent(comp.component_id)}
                className={`p-2.5 transition cursor-pointer flex flex-col space-y-1 hover:bg-space-850 ${
                  isSelected
                    ? 'bg-space-800/90 border-l-4 border-cyber-cyan shadow-inner'
                    : 'border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white tracking-tight">
                    {comp.component_id}
                  </span>
                  {getDecisionBadge(comp.decision)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="truncate max-w-[130px]">{comp.subsystem}</span>
                  <span>{comp.lot_id}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
                  <span className="text-slate-500 text-[10px]">
                    Risk Score:
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-12 bg-space-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full ${
                          comp.risk_score >= 70
                            ? 'bg-rose-500'
                            : comp.risk_score >= 35
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, comp.risk_score))}%` }}
                      />
                    </div>
                    <span className={`font-bold ${getRiskColor(comp.risk_score)}`}>
                      {comp.risk_score.toFixed(0)}
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
