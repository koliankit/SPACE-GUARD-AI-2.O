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
    <div className="flex flex-col h-full select-none font-share">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1E293B] text-[11px] font-mono text-slate-400 bg-[#030712]">
        <span className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="tracking-wider text-slate-200">ISTRAC SECURE AUDIT & COMPONENT FLIGHT LOG</span>
        </span>
        <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono">
          <span>SHA-256 INTEGRITY: <span className="text-[#00FF9D]">VERIFIED</span></span>
          <span>SESSION: {analysisId ? analysisId.slice(0, 8).toUpperCase() : 'ISRO-TEST'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 font-mono text-xs bg-[#040812]">
        {auditLogs.map((log) => {
          const isReject = log.event.includes('REJECT') || log.event.includes('flagged') || log.event.includes('CRITICAL');
          const isWarning = log.event.includes('WARN') || log.event.includes('DRIFT');
          return (
            <div
              key={log.id}
              className={`flex items-start space-x-2.5 p-2 rounded transition border ${
                isReject
                  ? 'bg-[#FF0055]/10 border-[#FF0055]/40 text-rose-300'
                  : isWarning
                  ? 'bg-[#FFB800]/10 border-[#FFB800]/40 text-amber-300'
                  : 'bg-[#060D1A]/80 border-[#1E293B] text-slate-300'
              }`}
            >
              <span className="text-slate-500 text-[10px] font-mono whitespace-nowrap pt-0.5">
                [{log.timestamp}]
              </span>
              {isReject ? (
                <AlertOctagon className="w-4 h-4 text-[#FF0055] shrink-0 mt-0.5" />
              ) : isWarning ? (
                <AlertOctagon className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 text-[#00FF9D] shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] leading-snug font-mono tracking-wide ${isReject ? 'font-bold text-[#FF0055]' : ''}`}>
                    {log.event}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    EVENT-ID #{log.id}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
