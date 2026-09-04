import axios from 'axios';
import {
  MissionStatusResponse,
  ComponentSummary,
  ComponentDetail,
  AnalysisResponse,
  PredictionResponse,
  AuditLog,
  UploadResponse,
  ReportSummary,
  HealthCheckResponse,
  DecisionType
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const api = {
  // Health checks
  getHealth: async (): Promise<HealthCheckResponse> => {
    const res = await apiClient.get<HealthCheckResponse>('/health');
    return res.data;
  },
  getDatabaseHealth: async (): Promise<HealthCheckResponse> => {
    const res = await apiClient.get<HealthCheckResponse>('/health/database');
    return res.data;
  },
  getMlHealth: async (): Promise<HealthCheckResponse> => {
    const res = await apiClient.get<HealthCheckResponse>('/health/ml');
    return res.data;
  },

  // Mission Status
  getMissionStatus: async (): Promise<MissionStatusResponse> => {
    const res = await apiClient.get<MissionStatusResponse>('/mission-status');
    return res.data;
  },

  // Components
  getComponents: async (filters?: {
    decision?: DecisionType;
    subsystem?: string;
    search?: string;
  }): Promise<ComponentSummary[]> => {
    const res = await apiClient.get<ComponentSummary[]>('/components', { params: filters });
    return res.data;
  },

  getComponentDetail: async (componentId: string): Promise<ComponentDetail> => {
    const res = await apiClient.get<ComponentDetail>(`/components/${componentId}`);
    return res.data;
  },

  getAnomalies: async (): Promise<ComponentSummary[]> => {
    const res = await apiClient.get<ComponentSummary[]>('/anomalies');
    return res.data;
  },

  getComponentPrediction: async (componentId: string): Promise<PredictionResponse> => {
    const res = await apiClient.get<PredictionResponse>(`/prediction/${componentId}`);
    return res.data;
  },

  // Demo flow
  loadDemo: async (): Promise<AnalysisResponse> => {
    const res = await apiClient.post<AnalysisResponse>('/demo/load');
    return res.data;
  },

  // File Upload
  uploadDataset: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<UploadResponse>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  submitColumnMapping: async (datasetId: string, mapping: Record<string, string>): Promise<UploadResponse> => {
    const res = await apiClient.post<UploadResponse>('/upload/map', {
      dataset_id: datasetId,
      mapping,
    });
    return res.data;
  },

  // Analysis
  runAnalysis: async (datasetId: string): Promise<AnalysisResponse> => {
    const res = await apiClient.post<AnalysisResponse>('/analyze', {
      dataset_id: datasetId,
    });
    return res.data;
  },

  getAnalysis: async (analysisId: string): Promise<AnalysisResponse> => {
    const res = await apiClient.get<AnalysisResponse>(`/analysis/${analysisId}`);
    return res.data;
  },

  // Audit Logs
  getAuditLog: async (analysisId: string): Promise<AuditLog[]> => {
    const res = await apiClient.get<AuditLog[]>(`/audit-log/${analysisId}`);
    return res.data;
  },

  // Reports
  getReports: async (analysisId: string): Promise<ReportSummary[]> => {
    const res = await apiClient.get<ReportSummary[]>(`/reports/${analysisId}`);
    return res.data;
  },

  generateReport: async (analysisId: string): Promise<{ report_id: string; report_url: string; message: string }> => {
    const res = await apiClient.post(`/reports/${analysisId}/generate`);
    return res.data;
  },
};
