import { EigenvalueDecomposition, Matrix } from 'ml-matrix';

/**
 * Computes a 2D embedding of the data using Kernel PCA (Classical MDS on a kernel matrix).
 * 
 * @param kernelMatrix A symmetric N x N numeric matrix.
 * @param dimensions Number of dimensions for the embedding (default 2).
 * @returns An array of coordinates (embedding: number[][])
 */
export function computeKernelPCA(kernelMatrix: number[][], dimensions: number = 2): number[][] {
  const n = kernelMatrix.length;
  const K = new Matrix(kernelMatrix);
  
  // Center the kernel matrix: Kc = K - 1_n * K - K * 1_n + 1_n * K * 1_n
  // where 1_n is a matrix with all elements equal to 1/n
  const oneN = new Matrix(n, n).fill(1 / n);
  
  // K_c = K - oneN*K - K*oneN + oneN*K*oneN
  const oneNK = oneN.mmul(K);
  const KoneN = K.mmul(oneN);
  const oneNKoneN = oneN.mmul(K).mmul(oneN);
  
  const Kc = K.sub(oneNK).sub(KoneN).add(oneNKoneN);
  
  // Eigendecomposition
  const evd = new EigenvalueDecomposition(Kc);
  const eigenvalues = evd.realEigenvalues;
  const eigenvectors = evd.eigenvectorMatrix; // Columns are eigenvectors

  // Sort eigenvalues and corresponding eigenvectors in descending order
  const indices = Array.from({ length: n }, (_, i) => i);
  indices.sort((a, b) => eigenvalues[b] - eigenvalues[a]);
  
  const embedding: number[][] = Array(n).fill(0).map(() => Array(dimensions).fill(0));
  
  for (let d = 0; d < dimensions; d++) {
    const idx = indices[d];
    // Numerical stability: clip negative eigenvalues to 0
    const lambda = Math.max(0, eigenvalues[idx]);
    const sqrtLambda = Math.sqrt(lambda);
    
    for (let i = 0; i < n; i++) {
      // eigenvectorMatrix.get(row, col)
      embedding[i][d] = eigenvectors.get(i, idx) * sqrtLambda;
    }
  }
  
  return embedding;
}
