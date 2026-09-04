import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  BarChart3,
  Clock,
  Radio,
  History,
  ChevronUp,
  ChevronDown,
  AlertOctagon,
  ShieldCheck,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { Header } from './components/Header/Header';
import { ComponentMonitor } from './components/Monitor/ComponentMonitor';
import { SatelliteCanvas } from './components/Satellite/SatelliteCanvas';
import { ComponentIntelligence } from './components/Intelligence/ComponentIntelligence';
import { TelemetryChart } from './components/Telemetry/TelemetryChart';
import { BurnInTimeline } from './components/Telemetry/BurnInTimeline';
import { MissionSimulationMap } from './components/MissionMap/MissionSimulationMap';
import { AuditLogView } from './components/Audit/AuditLogView';
import { UploadModal } from './components/Modals/UploadModal';
import { AnalysisProgressModal } from './components/Modals/AnalysisProgressModal';
import { ReportsModal } from './components/Modals/ReportsModal';

import { api } from './services/api';
import {
  MissionStatusResponse,
  ComponentSummary,
  ComponentDetail,
  ComponentResult,
  AnalysisResponse,
  AuditLog,
  ReportSummary,
  UploadResponse
} from './types';

export const App: React.FC = () => {
  // Global Server State
  const [missionStatus, setMissionStatus] = useState<MissionStatusResponse | null>(null);
  const [components, setComponents] = useState<ComponentSummary[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);

  // Selected Component State
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ComponentDetail | null>(null);

  // Modals & UI View State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStageIndex, setAnalysisStageIndex] = useState(0);

  // Bottom Panel Tab & Collapse
  const [bottomTab, setBottomTab] = useState<'telemetry' | 'timeline' | 'map' | 'audit'>('telemetry');
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // Map of componentId -> ComponentResult from active analysis
  const resultsMap = useMemo(() => {
    const map: Record<string, ComponentResult> = {};
    if (activeAnalysis?.results) {
      activeAnalysis.results.forEach((r) => {
        map[r.component_id] = r;
      });
    }
    return map;
  }, [activeAnalysis]);

  const selectedResult = selectedComponentId ? resultsMap[selectedComponentId] : null;

  // 1. Initial Data Fetch / Rehydration on Browser Refresh
  const fetchGlobalState = async () => {
    try {
      const [mStatus, comps] = await Promise.all([
        api.getMissionStatus(),
        api.getComponents(),
      ]);
      setMissionStatus(mStatus);
      setComponents(comps);

      if (mStatus.active_analysis_id) {
        const [analysisData, logsData, repData] = await Promise.all([
          api.getAnalysis(mStatus.active_analysis_id),
          api.getAuditLog(mStatus.active_analysis_id),
          api.getReports(mStatus.active_analysis_id),
        ]);
        setActiveAnalysis(analysisData);
        setAuditLogs(logsData);
        setReports(repData);
        setActiveDatasetId(mStatus.active_dataset_id || null);

        // Auto-select first critical anomaly if available, or first component
        if (mStatus.critical_components.length > 0) {
          setSelectedComponentId(mStatus.critical_components[0].component_id);
        } else if (comps.length > 0 && !selectedComponentId) {
          setSelectedComponentId(comps[0].component_id);
        }
      } else if (comps.length > 0 && !selectedComponentId) {
        setSelectedComponentId(comps[0].component_id);
      }
    } catch (err) {
      console.error('Error hydrating system state:', err);
    }
  };

  useEffect(() => {
    fetchGlobalState();
    // Periodic status poll (every 10 seconds for real-time mission status)
    const interval = setInterval(async () => {
      try {
        const mStatus = await api.getMissionStatus();
        setMissionStatus(mStatus);
      } catch (err) {
        // silent background refresh
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch details when selected component changes
  useEffect(() => {
    if (!selectedComponentId) return;

    let isMounted = true;
    api
      .getComponentDetail(selectedComponentId)
      .then((detail) => {
        if (isMounted) setSelectedDetail(detail);
      })
      .catch((err) => {
        console.error('Failed to get component detail:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedComponentId]);

  // 3. One-Click MISSION DEMO Flow
  const handleRunDemo = async () => {
    setIsAnalyzing(true);
    setAnalysisStageIndex(0);

    // Progress stage simulation aligned with real backend execution
    const stageTimer = setInterval(() => {
      setAnalysisStageIndex((prev) => (prev < 8 ? prev + 1 : prev));
    }, 450);

    try {
      const demoAnalysis = await api.loadDemo();
      clearInterval(stageTimer);
      setAnalysisStageIndex(8);

      setActiveAnalysis(demoAnalysis);
      setActiveDatasetId(demoAnalysis.dataset_id);

      // Refresh components & mission status
      const [mStatus, comps, logs, rep] = await Promise.all([
        api.getMissionStatus(),
        api.getComponents(),
        api.getAuditLog(demoAnalysis.analysis_id),
        api.getReports(demoAnalysis.analysis_id),
      ]);

      setMissionStatus(mStatus);
      setComponents(comps);
      setAuditLogs(logs);
      setReports(rep);

      // Auto-focus on COMP-FC-03 (the latent anomaly!)
      const fc03 = demoAnalysis.results.find((r) => r.component_id === 'COMP-FC-03');
      if (fc03) {
        setSelectedComponentId('COMP-FC-03');
      } else if (demoAnalysis.results.length > 0) {
        setSelectedComponentId(demoAnalysis.results[0].component_id);
      }
    } catch (err: any) {
      console.error('Demo execution failed:', err);
    } finally {
      clearInterval(stageTimer);
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 500);
    }
  };

  // 4. Run AI Screening on Uploaded Dataset
  const handleRunScreening = async (datasetId?: string) => {
    const targetId = datasetId || activeDatasetId;
    if (!targetId) return;

    setIsAnalyzing(true);
    setAnalysisStageIndex(0);

    const stageTimer = setInterval(() => {
      setAnalysisStageIndex((prev) => (prev < 8 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await api.runAnalysis(targetId);
      clearInterval(stageTimer);
      setAnalysisStageIndex(8);

      setActiveAnalysis(res);
      const [mStatus, comps, logs, rep] = await Promise.all([
        api.getMissionStatus(),
        api.getComponents(),
        api.getAuditLog(res.analysis_id),
        api.getReports(res.analysis_id),
      ]);

      setMissionStatus(mStatus);
      setComponents(comps);
      setAuditLogs(logs);
      setReports(rep);

      // If any reject components exist, auto focus first one
      const critical = res.results.find((r) => r.decision === 'REJECT');
      if (critical) {
        setSelectedComponentId(critical.component_id);
      } else if (res.results.length > 0) {
        setSelectedComponentId(res.results[0].component_id);
      }
    } catch (err) {
      console.error('Screening failed:', err);
    } finally {
      clearInterval(stageTimer);
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 500);
    }
  };

  const handleUploadSuccess = (uploadData: UploadResponse) => {
    setActiveDatasetId(uploadData.dataset_id);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-space-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Mission Header */}
      <Header
        missionStatus={missionStatus}
        onOpenUpload={() => setIsUploadOpen(true)}
        onRunDemo={handleRunDemo}
        onRunScreening={() => handleRunScreening()}
        onOpenReports={() => setIsReportsOpen(true)}
        isAnalyzing={isAnalyzing}
        hasActiveDataset={Boolean(activeDatasetId)}
      />

      {/* Main Workspace (Left 25% | Center 50% | Right 25%) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Component Monitor (25%) */}
        <div className="w-1/4 min-w-[280px] max-w-sm h-full flex flex-col">
          <ComponentMonitor
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={(id) => setSelectedComponentId(id)}
          />
        </div>

        {/* CENTER & BOTTOM COLUMN (50% Center, plus collapsible bottom) */}
        <div className="flex-1 flex flex-col h-full border-x border-slate-800">
          {/* CENTER: 3D Satellite Canvas */}
          <div className="flex-1 relative overflow-hidden bg-space-950">
            <SatelliteCanvas
              selectedComponentId={selectedComponentId}
              componentResults={resultsMap}
              onSelectComponent={(id) => setSelectedComponentId(id)}
            />
          </div>

          {/* BOTTOM PANEL (Collapsible with 4 tabs) */}
          <div
            className={`border-t border-slate-800 bg-space-900 transition-all duration-300 flex flex-col ${
              isBottomCollapsed ? 'h-9' : 'h-60'
            }`}
          >
            {/* Bottom Tab Bar */}
            <div className="h-9 bg-space-950 px-3 flex items-center justify-between border-b border-slate-800 select-none shrink-0">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <button
                  onClick={() => {
                    setBottomTab('telemetry');
                    setIsBottomCollapsed(false);
                  }}
                  className={`px-2.5 py-1 rounded transition flex items-center space-x-1.5 ${
                    bottomTab === 'telemetry' && !isBottomCollapsed
                      ? 'bg-space-800 text-cyber-cyan border border-slate-700 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>BURN-IN TELEMETRY</span>
                </button>

                <button
                  onClick={() => {
                    setBottomTab('timeline');
                    setIsBottomCollapsed(false);
                  }}
                  className={`px-2.5 py-1 rounded transition flex items-center space-x-1.5 ${
                    bottomTab === 'timeline' && !isBottomCollapsed
                      ? 'bg-space-800 text-cyber-cyan border border-slate-700 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>STAGE TIMELINE</span>
                </button>

                <button
                  onClick={() => {
                    setBottomTab('map');
                    setIsBottomCollapsed(false);
                  }}
                  className={`px-2.5 py-1 rounded transition flex items-center space-x-1.5 ${
                    bottomTab === 'map' && !isBottomCollapsed
                      ? 'bg-space-800 text-cyber-cyan border border-slate-700 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>MISSION LINK</span>
                </button>

                <button
                  onClick={() => {
                    setBottomTab('audit');
                    setIsBottomCollapsed(false);
                  }}
                  className={`px-2.5 py-1 rounded transition flex items-center space-x-1.5 ${
                    bottomTab === 'audit' && !isBottomCollapsed
                      ? 'bg-space-800 text-cyber-cyan border border-slate-700 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>AUDIT TRAIL ({auditLogs.length})</span>
                </button>
              </div>

              {/* Collapse / Expand Toggle */}
              <button
                onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
                className="p-1 rounded hover:bg-space-800 text-slate-400 hover:text-white transition"
                title={isBottomCollapsed ? 'Expand panel' : 'Collapse panel'}
              >
                {isBottomCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Bottom Content Area */}
            {!isBottomCollapsed && (
              <div className="flex-1 overflow-hidden p-2">
                {bottomTab === 'telemetry' && (
                  <TelemetryChart
                    componentDetail={selectedDetail}
                    componentResult={selectedResult}
                  />
                )}
                {bottomTab === 'timeline' && (
                  <BurnInTimeline
                    componentDetail={selectedDetail}
                    componentResult={selectedResult}
                  />
                )}
                {bottomTab === 'map' && (
                  <MissionSimulationMap missionStatus={missionStatus} />
                )}
                {bottomTab === 'audit' && (
                  <AuditLogView
                    auditLogs={auditLogs}
                    analysisId={activeAnalysis?.analysis_id}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Component Intelligence (25%) */}
        <div className="w-1/4 min-w-[300px] max-w-sm h-full flex flex-col">
          <ComponentIntelligence
            componentDetail={selectedDetail}
            componentResult={selectedResult}
          />
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        onRunScreening={(id) => handleRunScreening(id)}
      />

      <AnalysisProgressModal
        isOpen={isAnalyzing}
        activeStageIndex={analysisStageIndex}
      />

      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        activeAnalysisId={activeAnalysis?.analysis_id}
        reports={reports}
        onRefreshReports={async () => {
          if (activeAnalysis?.analysis_id) {
            const reps = await api.getReports(activeAnalysis.analysis_id);
            setReports(reps);
          }
        }}
      />
    </div>
  );
};

export default App;
