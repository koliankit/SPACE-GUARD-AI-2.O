export type DecisionType = 'SAFE' | 'MONITOR' | 'REJECT';

export interface ComponentSummary {
  component_id: string;
  subsystem: string;
  lot_id: string;
  risk_score: number;
  decision: DecisionType;
  anomaly_score: number;
  physical_model_id: string;
  parameter?: string;
  current_value?: number;
  datasheet_limit?: number;
}

export interface StageMeasurement {
  stage: string;
  value: number;
  datasheet_limit: number;
}

export interface ComponentDetail {
  component_id: string;
  subsystem: string;
  lot_id: string;
  physical_model_id: string;
  coordinates: [number, number, number];
  measurements: StageMeasurement[];
  latest_result?: ComponentResult;
}

export interface ComponentResult {
  component_id: string;
  subsystem: string;
  lot_id: string;
  parameter: string;
  current_value: number;
  datasheet_limit: number;
  anomaly_score: number;
  lot_relative_score: number;
  drift_rate: number;
  predicted_value?: number | null;
  risk_score: number;
  decision: DecisionType;
  explanation: string;
  physical_model_id: string;
  prediction_confidence?: string;
}

export interface AnalysisSummary {
  total_components: number;
  safe: number;
  monitor: number;
  reject: number;
  anomalies: number;
}

export interface AnalysisResponse {
  analysis_id: string;
  status: string;
  dataset_id: string;
  summary: AnalysisSummary;
  results: ComponentResult[];
  model_version: string;
  started_at?: string;
  completed_at?: string;
}

export interface MissionStatusResponse {
  system_online: boolean;
  ai_engine_online: boolean;
  database_online: boolean;
  data_stream_active: boolean;
  mission_health_score: number;
  summary: AnalysisSummary;
  active_analysis_id?: string | null;
  active_dataset_id?: string | null;
  critical_components: ComponentResult[];
  last_updated: string;
}

export interface AuditLog {
  id: string;
  analysis_run_id: string;
  event: string;
  timestamp: string;
  metadata?: Record<string, unknown> | null;
}

export interface DataQualityReport {
  total_rows: number;
  valid_rows: number;
  missing_rows: number;
  duplicate_rows: number;
  component_count: number;
  lot_count: number;
  parameter_count: number;
  available_stages: string[];
  quality_score: number;
  issues: string[];
}

export interface ColumnMappingPreview {
  detected_columns: Record<string, string>;
  available_headers: string[];
  confidence: number;
  sample_rows: Record<string, unknown>[];
}

export interface UploadResponse {
  dataset_id: string;
  filename: string;
  status: string;
  data_quality: DataQualityReport;
  mapping_preview: ColumnMappingPreview;
  requires_manual_mapping: boolean;
}

export interface PredictionResponse {
  component_id: string;
  parameter: string;
  observed_stages: { stage: string; value: number }[];
  drift_rate: number;
  predicted_value?: number | null;
  prediction_horizon_hours: number;
  datasheet_limit: number;
  time_to_limit_hours?: number | null;
  prediction_confidence: string;
  message?: string | null;
}

export interface ReportSummary {
  id: string;
  analysis_run_id: string;
  report_path: string;
  report_type: string;
  created_at: string;
  total_components: number;
  anomaly_count: number;
  status: string;
}

export interface HealthCheckResponse {
  status: string;
  service?: string;
  database?: string;
  ml_engine?: string;
  version?: string;
  timestamp: string;
}
