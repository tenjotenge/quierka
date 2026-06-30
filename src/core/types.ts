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

export interface KernelComputationResult {
  matrix: number[][];
  metrics: KernelMetrics;
  spectrum?: number[];
  stats?: {
    effectiveRank: number;
    entropy: number;
  };
}
