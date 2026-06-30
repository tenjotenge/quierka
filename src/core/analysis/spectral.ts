import { EigenvalueDecomposition, Matrix } from 'ml-matrix';

export interface SpectralProperties {
  spectrum: number[];
  effectiveRank: number;
  entropy: number;
  leadingEigenvaluePercentage: number;
  interpretation: string;
}

function generateInterpretation(effectiveRank: number, leadingPercentage: number, n: number): string {
  if (leadingPercentage > 0.8) {
    return "This spectrum is highly concentrated. The kernel projects data into a lower-dimensional subspace where most variance is captured by the first few components.";
  } else if (effectiveRank > n * 0.5) {
    return "This spectrum is very flat. The kernel induces a high-dimensional feature space where points are roughly equidistant, suggesting a lack of strong low-dimensional structure.";
  } else {
    return "This spectrum shows a moderate decay. The kernel captures a mix of global geometric structure and higher-dimensional local details.";
  }
}

/**
 * Computes the spectral properties of a symmetric kernel matrix.
 * 
 * @param kernelMatrix A symmetric N x N numeric matrix.
 * @returns SpectralProperties including the descending sorted eigenvalues, effective rank, and spectral entropy.
 */
export function computeSpectralProperties(kernelMatrix: number[][]): SpectralProperties {
  const K = new Matrix(kernelMatrix);
  const evd = new EigenvalueDecomposition(K);
  
  let eigenvalues = evd.realEigenvalues;

  // Sort descending
  eigenvalues.sort((a, b) => b - a);
  
  // Filter out negative values caused by numerical instability
  eigenvalues = eigenvalues.map(v => Math.max(0, v));

  const sumEigenvalues = eigenvalues.reduce((a, b) => a + b, 0);

  let entropy = 0;
  let leadingEigenvaluePercentage = 0;
  
  if (sumEigenvalues > 0) {
    for (const lambda of eigenvalues) {
      if (lambda > 0) {
        const p = lambda / sumEigenvalues;
        entropy -= p * Math.log(p);
      }
    }
    leadingEigenvaluePercentage = eigenvalues[0] / sumEigenvalues;
  }

  const effectiveRank = Math.exp(entropy);
  
  const interpretation = generateInterpretation(effectiveRank, leadingEigenvaluePercentage, eigenvalues.length);

  return {
    spectrum: eigenvalues,
    effectiveRank,
    entropy,
    leadingEigenvaluePercentage,
    interpretation
  };
}
