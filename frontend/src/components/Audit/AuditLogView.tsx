import React from 'react';
import { History, Shield, CheckCircle, AlertOctagon, Terminal } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogViewProps {
  auditLogs: AuditLog[];
  analysisId?: string | null;
  isLoading?: boolean;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  analysisId,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-xs font-mono text-slate-500 animate-pulse">
        Retrieving persistent audit trail from database...
      </div>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-xs font-mono text-slate-500">
        <History className="w-5 h-5 mb-1 text-slate-600" />
        <span>No audit log records found for active analysis.</span>
        <span className="text-[10px] text-slate-600 mt-0.5">Run screening or load demo to populate audit history.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full select-none">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <span className="flex items-center space-x-1.5">
          <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>PERSISTENT AUDIT TRAIL</span>
        </span>
        <span className="text-[10px] text-slate-500">
          Run ID: {analysisId ? analysisId.slice(0, 8) : 'N/A'} • {auditLogs.length} Events
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 font-mono text-xs">
        {auditLogs.map((log) => {
          const isReject = log.event.includes('REJECT') || log.event.includes('flagged');
          return (
            <div
              key={log.id}
              className={`flex items-start space-x-2.5 p-1.5 rounded transition ${
                isReject ? 'bg-rose-950/30 border border-rose-500/20' : 'bg-space-950/60 border border-slate-800/80'
              }`}
            >
              <span className="text-slate-500 text-[10px] whitespace-nowrap pt-0.5">
                {log.timestamp}
              </span>
              {isReject ? (
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <span className={`text-[11px] leading-snug ${isReject ? 'text-rose-300 font-semibold' : 'text-slate-300'}`}>
                {log.event}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
