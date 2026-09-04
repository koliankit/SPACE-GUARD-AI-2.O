import React, { useState } from 'react';
import { FileText, Download, X, CheckCircle, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { ReportSummary } from '../../types';
import { api } from '../../services/api';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAnalysisId?: string | null;
  reports: ReportSummary[];
  onRefreshReports: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  activeAnalysisId,
  reports,
  onRefreshReports,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    if (!activeAnalysisId) return;
    setIsGenerating(true);
    setGenerateMsg(null);
    try {
      const res = await api.generateReport(activeAnalysisId);
      setGenerateMsg(res.message);
      onRefreshReports();
      if (res.report_url && res.report_url !== '#') {
        // Trigger direct file download
        const a = document.createElement('a');
        a.href = res.report_url;
        a.download = `SPACEGUARD_Screening_Report_${activeAnalysisId.slice(0, 8)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Open in new tab with print/save as PDF button
        window.open(res.report_url, '_blank');
      }
    } catch (err: any) {
      setGenerateMsg('Failed to generate report: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (rep: ReportSummary) => {
    try {
      await api.downloadReport(rep.id, rep.analysis_run_id);
    } catch (err: any) {
      setGenerateMsg('Download error: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-space-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-space-950">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyber-cyan" />
            <h3 className="text-sm font-mono font-bold text-white tracking-wide">
              AEROSPACE RELIABILITY SCREENING REPORTS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Action Bar */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-space-950 border border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                OFFICIAL REPORT GENERATION
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Produces full PDF report with component matrices, lot z-scores, and AI diagnosis.
              </span>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || !activeAnalysisId}
              className="px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-cyber-blue hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-md disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'GENERATING PDF...' : 'GENERATE PDF REPORT'}</span>
            </button>
          </div>

          {generateMsg && (
            <div className="p-2.5 rounded bg-space-850 border border-cyber-cyan/40 text-xs font-mono text-cyan-300">
              {generateMsg}
            </div>
          )}

          {/* Reports History Table */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 font-bold block">
              GENERATED ARCHIVE ({reports.length})
            </span>

            {reports.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-500 bg-space-950 rounded border border-slate-800">
                No reports generated yet. Click "GENERATE PDF REPORT" above to create one.
              </div>
            ) : (
              <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-space-950 overflow-hidden">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 flex items-center justify-between hover:bg-space-900 transition text-xs font-mono"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">
                          SPACEGUARD Screening Report
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-space-800 text-cyber-cyan border border-slate-700">
                          {rep.report_type}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Created: {rep.created_at.slice(0, 19).replace('T', ' ')} UTC • Run ID:{' '}
                        {rep.analysis_run_id.slice(0, 8)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadReport(rep)}
                      className="px-2.5 py-1 rounded bg-space-800 hover:bg-space-700 text-cyber-cyan font-mono text-xs border border-slate-700 flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>DOWNLOAD</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
