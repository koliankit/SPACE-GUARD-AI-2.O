import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { UploadResponse, DataQualityReport } from '../../types';
import { api } from '../../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (uploadData: UploadResponse) => void;
  onRunScreening: (datasetId: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  onRunScreening,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMsg('Invalid format. Please select a CSV or Excel (.xlsx) file.');
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMsg(null);

    try {
      const res = await api.uploadDataset(selectedFile);
      setUploadResult(res);
      onUploadSuccess(res);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to upload dataset.';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunScreening = () => {
    if (uploadResult?.dataset_id) {
      onRunScreening(uploadResult.dataset_id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-share">
      <div className="bg-[#040914] border border-[#00E5FF]/40 rounded-lg shadow-[0_0_50px_rgba(0,229,255,0.2)] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] corner-box relative">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#030712]">
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="text-sm font-mono font-bold text-white tracking-widest">
              ISRO SDSC-SHAR // BURN-IN & TELEMETRY INGESTION GATEWAY
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto bg-[#040812]">
          {!uploadResult ? (
            <>
              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                  dragActive
                    ? 'border-[#00E5FF] bg-[#00E5FF]/10'
                    : 'border-[#1E293B] hover:border-[#00E5FF]/60 bg-[#030712]'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                  className="hidden"
                />

                <FileText className="w-10 h-10 text-cyber-cyan mb-2" />
                <span className="text-xs font-mono font-bold text-white mb-1">
                  {selectedFile ? selectedFile.name : 'Drop burn-in dataset here or browse'}
                </span>
                <p className="text-[11px] text-slate-400 font-mono">
                  Supports Wide Format (0h, 24h, 96h, 168h) & Long Format (stage, value)
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Automatic column alias detection for Component ID, Lot, Parameter, and Spec Limits
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded bg-rose-950/50 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {selectedFile && (
                <div className="flex items-center justify-between p-2.5 rounded bg-space-950 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-3 py-1.5 rounded bg-cyber-blue hover:bg-blue-500 text-white font-mono text-xs font-bold transition disabled:opacity-50"
                  >
                    {isUploading ? 'VALIDATING...' : 'PROCESS DATASET'}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Upload & Data Quality Summary Card */
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">
                    Dataset validated and stored in persistent database.
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">ID: {uploadResult.dataset_id.slice(0, 8)}</span>
              </div>

              {/* Data Quality Engine Card */}
              <div className="p-4 rounded-lg bg-space-950 border border-slate-800 text-xs font-mono space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-300">DATA QUALITY ASSESSMENT</span>
                  <span
                    className={`font-bold text-sm ${
                      uploadResult.data_quality.quality_score >= 80
                        ? 'text-emerald-400'
                        : uploadResult.data_quality.quality_score >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {uploadResult.data_quality.quality_score.toFixed(1)}% SCORE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-slate-400 text-[11px]">
                  <div className="bg-space-900 p-2 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-500 block">TOTAL ROWS</span>
                    <span className="text-white font-bold text-xs">{uploadResult.data_quality.total_rows}</span>
                  </div>
                  <div className="bg-space-900 p-2 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-500 block">VALID ROWS</span>
                    <span className="text-emerald-400 font-bold text-xs">{uploadResult.data_quality.valid_rows}</span>
                  </div>
                  <div className="bg-space-900 p-2 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-500 block">MISSING READINGS</span>
                    <span className="text-amber-400 font-bold text-xs">{uploadResult.data_quality.missing_rows}</span>
                  </div>
                  <div className="bg-space-900 p-2 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-500 block">COMPONENTS</span>
                    <span className="text-white font-bold text-xs">{uploadResult.data_quality.component_count}</span>
                  </div>
                  <div className="bg-space-900 p-2 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-500 block">LOTS</span>
                    <span className="text-white font-bold text-xs">{uploadResult.data_quality.lot_count}</span>
                  </div>
                  <div className="bg-space-900 p-2 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-500 block">STAGES DETECTED</span>
                    <span className="text-cyber-cyan font-bold text-[10px] truncate block">
                      {uploadResult.data_quality.available_stages.join(', ')}
                    </span>
                  </div>
                </div>

                {uploadResult.data_quality.issues.length > 0 && (
                  <div className="p-2.5 rounded bg-space-900 border border-slate-800 text-[11px] text-amber-300">
                    <span className="font-bold block mb-1">Validation Notes:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-300">
                      {uploadResult.data_quality.issues.slice(0, 4).map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action */}
              <button
                onClick={handleRunScreening}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>RUN AI SCREENING NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
