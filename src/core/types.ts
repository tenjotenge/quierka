export interface Dataset {
  X: number[][]; // [N, features] array
  y: number[];   // [N] array of labels
}

export type KernelFunction = (x: number[], y: number[]) => number;

export interface KernelDefinition {
  name: string;
  func: KernelFunction;
  description: string;
}

export interface KernelMetrics {
  timeMs: number;
  datasetSize: number;
  kernelName: string;
  memoryEstimateBytes: number;
}

export interface SensitivityMetrics {
  stabilityScore: number;
  meanChange: number;
  variance: number;
  perPointSensitivity: number[];
}

export interface AnalysisResult {
  spectrum: number[];
  embedding: number[][];
  statistics: {
    effectiveRank: number;
    entropy: number;
    leadingEigenvaluePercentage: number;
  };
  interpretation: string;
  sensitivity?: SensitivityMetrics;
}

export interface KernelComputationResult {
  matrix: number[][];
  metrics: KernelMetrics;
  analysis?: AnalysisResult;
}

export interface Selection {
  datasetIndex: number;
  sourceView: "dataset" | "geometry" | "heatmap";
}

export interface AnalysisSelection {
  selectedIndex: number;
  similarities: number[];
  neighbors: number[];
}
