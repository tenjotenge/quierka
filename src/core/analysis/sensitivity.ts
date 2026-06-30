import { KernelFunction } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SensitivityResult {
  /** Normalized score in [0, 1]. Higher = more stable under perturbation. */
  stabilityScore: number;
  /** Mean absolute change in kernel values across all pairs after perturbation. */
  meanChange: number;
  /** Variance of per-pair kernel change. */
  variance: number;
  /**
   * Per-point sensitivity: for each point i, the mean |K(xi,xj) - K(xi',xj)|
   * averaged over all j. Reflects how much that point's relationships shift.
   */
  perPointSensitivity: number[];
}

// ---------------------------------------------------------------------------
// Gaussian perturbation helpers
// ---------------------------------------------------------------------------

/**
 * Box-Muller transform: generates a single standard-normal sample.
 * Pure function, no external deps.
 */
function sampleStdNormal(): number {
  // Use two uniform samples
  const u1 = Math.random();
  const u2 = Math.random();
  // Guard against log(0)
  return Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
}

/**
 * Returns a perturbed copy of X where each feature value is shifted by N(0, epsilon^2).
 */
function perturbDataset(X: number[][], epsilon: number): number[][] {
  return X.map(row => row.map(v => v + epsilon * sampleStdNormal()));
}

// ---------------------------------------------------------------------------
// Core computation
// ---------------------------------------------------------------------------

/**
 * Computes sensitivity metrics for a kernel function under Gaussian perturbation.
 *
 * Algorithm:
 *   1. Generate X' = X + epsilon * N(0, I)
 *   2. For each pair (i, j): delta_ij = |K(xi, xj) - K(xi', xj)|
 *   3. Aggregate: meanChange, variance over all delta_ij
 *   4. Per-point: mean over j of delta_ij for each i
 *   5. stabilityScore = 1 / (1 + meanChange)   (normalized to [0, 1])
 *
 * @param X        Dataset points [N, D]
 * @param kernelFn Kernel function to probe
 * @param epsilon  Perturbation magnitude (0 = no noise, 1 = large noise)
 * @param trials   Number of perturbation trials to average over (default 5)
 */
export function computeSensitivity(
  X: number[][],
  kernelFn: KernelFunction,
  epsilon: number = 0.1,
  trials: number = 5
): SensitivityResult {
  const n = X.length;
  // Accumulate absolute deltas per trial, then average
  const accumulated: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let t = 0; t < trials; t++) {
    const Xp = perturbDataset(X, epsilon);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const orig = kernelFn(X[i], X[j]);
        const perturbed = kernelFn(Xp[i], X[j]); // only xi is perturbed
        accumulated[i][j] += Math.abs(orig - perturbed);
      }
    }
  }

  // Normalize by trial count and collect flat delta list
  const flatDeltas: number[] = [];
  const perPointSums: number[] = Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const avgDelta = accumulated[i][j] / trials;
      flatDeltas.push(avgDelta);
      perPointSums[i] += avgDelta;
    }
  }

  const totalPairs = n * n;
  const meanChange = flatDeltas.reduce((a, b) => a + b, 0) / totalPairs;
  const variance = flatDeltas.reduce((acc, d) => acc + Math.pow(d - meanChange, 2), 0) / totalPairs;

  // Per-point: average delta over all j
  const perPointSensitivity = perPointSums.map(s => s / n);

  // Stability score: monotonically decreasing in meanChange, bounded [0, 1]
  const stabilityScore = 1 / (1 + meanChange);

  return { stabilityScore, meanChange, variance, perPointSensitivity };
}
