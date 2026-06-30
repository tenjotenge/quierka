import { EigenvalueDecomposition, Matrix } from 'ml-matrix';

export interface SpectralProperties {
  spectrum: number[];
  effectiveRank: number;
  entropy: number;
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
  
  // getRealEigenvalues returns the real part of eigenvalues. Since K is symmetric, eigenvalues are real.
  let eigenvalues = evd.realEigenvalues;

  // Sort descending
  eigenvalues.sort((a, b) => b - a);
  
  // Filter out negative values caused by numerical instability (kernel matrices should be PSD)
  eigenvalues = eigenvalues.map(v => Math.max(0, v));

  const sumEigenvalues = eigenvalues.reduce((a, b) => a + b, 0);

  let entropy = 0;
  if (sumEigenvalues > 0) {
    for (const lambda of eigenvalues) {
      if (lambda > 0) {
        const p = lambda / sumEigenvalues;
        entropy -= p * Math.log(p);
      }
    }
  }

  // Effective Rank defined as exp(Shannon Entropy) of the normalized eigenvalues
  const effectiveRank = Math.exp(entropy);

  return {
    spectrum: eigenvalues,
    effectiveRank,
    entropy
  };
}
