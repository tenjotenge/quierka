import { AnalysisResult, AnalysisSelection, KernelFunction } from '../types';
import { computeSpectralProperties } from './spectral';
import { computeKernelPCA } from './geometry';
import { computeSensitivity } from './sensitivity';

// ---------------------------------------------------------------------------
// Pipeline input/output types
// ---------------------------------------------------------------------------

export interface KernelPipelineInput {
  /** The computed N x N kernel matrix. */
  matrix: number[][];
  /** Optional index of the point the user has selected. */
  selectedIndex?: number;
  /**
   * Raw dataset points. Required by sensitivity module.
   * Other modules ignore this field.
   */
  datasetX?: number[][];
  /**
   * Kernel function used to compute the matrix.
   * Required by sensitivity module for perturbation re-evaluation.
   */
  kernelFunc?: KernelFunction;
  /** Gaussian perturbation magnitude passed to sensitivity module. Default 0.1. */
  perturbationEpsilon?: number;
}

export interface KernelPipelineOutput {
  /** Spectral analysis and Kernel PCA embedding. Present whenever the pipeline runs. */
  analysis: AnalysisResult;
  /** Similarity vector and neighbor ranking for the selected point. Only present when selectedIndex is provided. */
  selectionAnalysis?: AnalysisSelection;
}

// ---------------------------------------------------------------------------
// Module interface
// The pipeline executes a list of registered modules in order.
// Each module receives the input and a partial output object it can extend.
// Keeping it simple: no abstract classes, no decorators, just functions.
// ---------------------------------------------------------------------------

export interface AnalysisModule {
  name: string;
  /** Mutates output in place. Returns nothing. */
  run(input: KernelPipelineInput, output: Partial<KernelPipelineOutput>): void;
}

// ---------------------------------------------------------------------------
// Module implementations
// ---------------------------------------------------------------------------

/**
 * SpectralModule — computes eigenvalue spectrum, effective rank, entropy,
 * and a short human-readable interpretation of the spectral shape.
 */
const spectralModule: AnalysisModule = {
  name: 'spectral',
  run(input, output) {
    const props = computeSpectralProperties(input.matrix);
    // Initialise the analysis object; geometry will extend it.
    output.analysis = {
      spectrum: props.spectrum,
      embedding: [],          // filled by geometryModule
      statistics: {
        effectiveRank: props.effectiveRank,
        entropy: props.entropy,
        leadingEigenvaluePercentage: props.leadingEigenvaluePercentage,
      },
      interpretation: props.interpretation,
    };
  },
};

/**
 * GeometryModule — computes the 2D Kernel PCA embedding.
 * Depends on spectralModule having populated output.analysis first.
 */
const geometryModule: AnalysisModule = {
  name: 'geometry',
  run(input, output) {
    if (!output.analysis) return; // safety guard
    output.analysis.embedding = computeKernelPCA(input.matrix, 2);
  },
};

/**
 * SensitivityModule — measures kernel stability under Gaussian perturbation.
 * Requires input.datasetX and input.kernelFunc to be present.
 * Skips silently if they are absent (e.g. when called with matrix-only input).
 */
const sensitivityModule: AnalysisModule = {
  name: 'sensitivity',
  run(input, output) {
    if (!output.analysis || !input.datasetX || !input.kernelFunc) return;
    const epsilon = input.perturbationEpsilon ?? 0.1;
    output.analysis.sensitivity = computeSensitivity(input.datasetX, input.kernelFunc, epsilon);
  },
};

/**
 * SelectionModule — computes per-point similarities and neighbor ranking
 * when the caller has provided a selectedIndex.
 */
const selectionModule: AnalysisModule = {
  name: 'selection',
  run(input, output) {
    if (input.selectedIndex === undefined) return;

    const { matrix, selectedIndex } = input;
    const similarities = matrix[selectedIndex];
    const n = similarities.length;

    // Sort all other points by similarity descending
    const neighbors = Array.from({ length: n }, (_, i) => i)
      .filter(i => i !== selectedIndex)
      .sort((a, b) => similarities[b] - similarities[a]);

    output.selectionAnalysis = { selectedIndex, similarities, neighbors };
  },
};

// ---------------------------------------------------------------------------
// Pipeline registry
// Modules execute in the order they appear in this array.
// To add a new analysis: implement AnalysisModule and append it here.
// ---------------------------------------------------------------------------

const registeredModules: AnalysisModule[] = [
  spectralModule,
  geometryModule,
  sensitivityModule,  // runs after geometry; needs datasetX + kernelFunc in input
  selectionModule,
];

// ---------------------------------------------------------------------------
// Pipeline runner
// ---------------------------------------------------------------------------

/**
 * Runs all registered analysis modules against the provided kernel matrix.
 *
 * @param input  KernelPipelineInput with the matrix and optional selectedIndex.
 * @returns      KernelPipelineOutput with analysis and optional selectionAnalysis.
 */
export function runAnalysisPipeline(input: KernelPipelineInput): KernelPipelineOutput {
  const output: Partial<KernelPipelineOutput> = {};

  for (const mod of registeredModules) {
    try {
      mod.run(input, output);
    } catch (err) {
      console.error(`[AnalysisPipeline] Module "${mod.name}" failed:`, err);
    }
  }

  // analysis is always populated by spectralModule; cast is safe here
  return output as KernelPipelineOutput;
}
