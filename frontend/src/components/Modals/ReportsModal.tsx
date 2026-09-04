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
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    if (!activeAnalysisId) return;
    setIsGenerating(true);
    setGenerateMsg(null);
    setDownloadUrl(null);
    try {
      const res = await api.generateReport(activeAnalysisId);
      setGenerateMsg(res.message);
      onRefreshReports();
      if (res.report_url && res.report_url !== '#') {
        setDownloadUrl(res.report_url);
        // Direct browser file download of .pdf
        const a = document.createElement('a');
        a.href = res.report_url;
        a.download = `SPACEGUARD_Report_${activeAnalysisId.slice(0, 8)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-share">
      <div className="bg-[#040914] border border-[#00E5FF]/40 rounded-lg shadow-[0_0_50px_rgba(0,229,255,0.2)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] corner-box relative">
        {/* Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#030712]">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="text-sm font-mono font-bold text-white tracking-widest">
              ISRO SDSC-SHAR // SPACE-GRADE FLIGHT QUALIFICATION CERTIFICATES
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
        <div className="p-5 space-y-4 flex-1 overflow-y-auto bg-[#040812]">
          {/* Action Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#030712] border border-[#1E293B]">
            <div>
              <span className="text-xs font-mono font-bold text-white block tracking-wider">
                OFFICIAL ISRO MISSION FLIGHT CLEARANCE REPORT
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Generates high-resolution PDF with component risk matrices, lot z-scores, and flight clearance stamps.
              </span>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || !activeAnalysisId}
              className="px-3.5 py-1.5 rounded bg-gradient-to-r from-[#00E5FF] to-[#0099FF] hover:opacity-90 text-black font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'GENERATING CERTIFICATE...' : 'GENERATE PDF'}</span>
            </button>
          </div>

          {generateMsg && (
            <div className="p-3 rounded-lg bg-space-850 border border-cyber-cyan/40 text-xs font-mono text-cyan-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{generateMsg}</span>
              </div>
              {downloadUrl && (
                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <a
                    href={downloadUrl}
                    download={`SPACEGUARD_Report_${activeAnalysisId?.slice(0, 8) || 'RUN'}.pdf`}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold rounded text-[11px] flex items-center space-x-1.5 shadow transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD PDF</span>
                  </a>
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-space-800 hover:bg-space-700 text-slate-200 rounded text-[11px] flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>VIEW</span>
                  </a>
                </div>
              )}
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
