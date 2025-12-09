/**
 * Analysis API Service (Frontend)
 * 
 * Service pour recalculer et analyser les diagrammes VSM
 */

import { apiClient } from './client';

export interface VSMMetrics {
  totalLeadTime: number;
  valueAddedTime: number;
  valueAddedPercentage: number;
  totalInventoryDays: number;
  totalProcessSteps: number;
  bottleneckStep?: {
    nodeId: string;
    nodeName: string;
    cycleTime: number;
  };
  averageCycleTime: number;
  taktTime?: number;
}

export interface AnalysisResult {
  timestamp: string;
  summary: {
    totalIssues: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    score: number;
  };
  bottlenecks: Bottleneck[];
  wastes: Waste[];
  opportunities: Opportunity[];
}

export interface Bottleneck {
  nodeId: string;
  nodeName: string;
  type: 'cycle_time' | 'uptime' | 'capacity';
  severity: 'medium' | 'high' | 'critical';
  impact: string;
  recommendation: string;
  metrics: {
    current: number;
    optimal?: number;
    difference?: number;
  };
}

export interface Waste {
  type: 'overproduction' | 'waiting' | 'transport' | 'overprocessing' | 'inventory' | 'motion' | 'defects';
  location: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  potentialSavings?: {
    timeReduction: number;
    costReduction?: number;
  };
}

export interface Opportunity {
  type: 'process_improvement' | 'inventory_reduction' | 'time_reduction';
  priority: 'low' | 'medium' | 'high';
  description: string;
  expectedBenefit: string;
  effort: 'low' | 'medium' | 'high';
}

export interface RecalculateResponse {
  diagram: any;
  metrics: VSMMetrics;
  analysis: AnalysisResult;
}

/**
 * Recalculer les métriques et analyser un diagramme
 */
export async function recalculateDiagram(
  diagramId: string,
  diagramData: any
): Promise<RecalculateResponse> {
  const response = await apiClient.post<RecalculateResponse>(
    `/diagrams/${diagramId}/recalculate`,
    { data: diagramData }
  );
  return response.data;
}

/**
 * Obtenir uniquement les métriques
 */
export async function getMetrics(diagramId: string): Promise<VSMMetrics> {
  const response = await apiClient.get<VSMMetrics>(`/diagrams/${diagramId}/metrics`);
  return response.data;
}

/**
 * Obtenir uniquement l'analyse
 */
export async function getAnalysis(diagramId: string): Promise<AnalysisResult> {
  const response = await apiClient.get<AnalysisResult>(`/diagrams/${diagramId}/analysis`);
  return response.data;
}
