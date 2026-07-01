import { KernelFunction } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClassificationResult {
  /** Predicted labels for training points (0 or 1) */
  predictedLabels: number[];
  /** Training accuracy (fraction of correctly classified points) */
  trainingAccuracy: number;
  /** Continuous decision values (positive = class 1, negative = class 0) */
  decisionValues: number[];
  /** Indices of support vectors (points with non-zero alpha in dual formulation) */
  supportVectorIndices: number[];
  /** Number of support vectors */
  supportVectorCount: number;
  /** Margin estimate: minimum distance of any point to the decision boundary */
  marginEstimate: number;
  /** Interpretation string based on measured metrics */
  interpretation: string;
}

// ---------------------------------------------------------------------------
// Kernel Ridge Regression Classifier (Binary)
// ---------------------------------------------------------------------------

/**
 * Trains a binary kernel classifier using kernel ridge regression.
 * 
 * This is a lightweight, educational implementation suitable for visualization.
 * It solves the dual problem: alpha = (K + lambda*I)^-1 * y
 * 
 * For a new point x: f(x) = sum_i alpha_i * K(x_i, x)
 * 
 * Decision boundary: f(x) = 0.5 (threshold for binary classification)
 * 
 * @param X Training points [N, D]
 * @param y Training labels [N] (0 or 1)
 * @param kernel Kernel function
 * @param lambda Regularization parameter (default 0.01)
 * @returns ClassificationResult with predictions and metrics
 */
export function trainKernelClassifier(
  X: number[][],
  y: number[],
  kernel: KernelFunction,
  lambda: number = 0.01
): ClassificationResult {
  const n = X.length;
  
  // 1. Compute kernel matrix K
  const K: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const val = kernel(X[i], X[j]);
      K[i][j] = val;
      K[j][i] = val;
    }
  }
  
  // 2. Add regularization: K_reg = K + lambda * I
  const K_reg: number[][] = Array(n).fill(0).map((_, i) => 
    Array(n).fill(0).map((_, j) => K[i][j] + (i === j ? lambda : 0))
  );
  
  // 3. Solve linear system K_reg * alpha = y using Gaussian elimination
  //    (Simple O(n^3) solver - acceptable for small educational datasets)
  const alpha = solveLinearSystem(K_reg, y);
  
  // 4. Compute decision values for training points
  const decisionValues: number[] = [];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += alpha[j] * K[i][j];
    }
    decisionValues.push(sum);
  }
  
  // 5. Predict labels (threshold at 0.5)
  const predictedLabels = decisionValues.map(dv => dv >= 0.5 ? 1 : 0);
  
  // 6. Compute training accuracy
  let correct = 0;
  for (let i = 0; i < n; i++) {
    if (predictedLabels[i] === y[i]) correct++;
  }
  const trainingAccuracy = correct / n;
  
  // 7. Identify support vectors (points with |alpha_i| > threshold)
  const alphaThreshold = 1e-6;
  const supportVectorIndices: number[] = [];
  for (let i = 0; i < n; i++) {
    if (Math.abs(alpha[i]) > alphaThreshold) {
      supportVectorIndices.push(i);
    }
  }
  
  // 8. Estimate margin: minimum |f(x_i) - 0.5| for correctly classified points
  let marginEstimate = Infinity;
  for (let i = 0; i < n; i++) {
    if (predictedLabels[i] === y[i]) {
      const distance = Math.abs(decisionValues[i] - 0.5);
      if (distance < marginEstimate) marginEstimate = distance;
    }
  }
  if (marginEstimate === Infinity) marginEstimate = 0;
  
  // 9. Generate interpretation
  const interpretation = generateInterpretation(
    trainingAccuracy,
    supportVectorIndices.length,
    n,
    marginEstimate
  );
  
  return {
    predictedLabels,
    trainingAccuracy,
    decisionValues,
    supportVectorIndices,
    supportVectorCount: supportVectorIndices.length,
    marginEstimate,
    interpretation
  };
}

/**
 * Predicts decision values for new points using a trained kernel classifier.
 * 
 * @param X_train Training points [N, D]
 * @param x_new New point to classify [D]
 * @param kernel Kernel function
 * @param alpha Dual coefficients from training
 * @returns Decision value (continuous)
 */
export function predictKernelClassifier(
  X_train: number[][],
  x_new: number[],
  kernel: KernelFunction,
  alpha: number[]
): number {
  let sum = 0;
  for (let i = 0; i < X_train.length; i++) {
    sum += alpha[i] * kernel(X_train[i], x_new);
  }
  return sum;
}

// ---------------------------------------------------------------------------
// Linear System Solver (Gaussian Elimination with Partial Pivoting)
// ---------------------------------------------------------------------------

/**
 * Solves Ax = b for a square matrix A using Gaussian elimination.
 * Pure TypeScript implementation - no external dependencies.
 * 
 * @param A Square matrix [N, N]
 * @param b Right-hand side vector [N]
 * @returns Solution vector x [N]
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  
  // Create augmented matrix [A | b]
  const aug: number[][] = Array(n).fill(0).map((_, i) => 
    [...A[i], b[i]]
  );
  
  // Forward elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    // Find pivot (maximum absolute value in current column)
    let maxVal = Math.abs(aug[col][col]);
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > maxVal) {
        maxVal = Math.abs(aug[row][col]);
        maxRow = row;
      }
    }
    
    // Swap rows
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    
    // Make all rows below this one 0 in current column
    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }
  
  // Back substitution
  const x: number[] = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= aug[i][j] * x[j];
    }
    x[i] /= aug[i][i];
  }
  
  return x;
}

// ---------------------------------------------------------------------------
// Interpretation Generator
// ---------------------------------------------------------------------------

function generateInterpretation(
  accuracy: number,
  svCount: number,
  totalPoints: number,
  margin: number
): string {
  const svRatio = svCount / totalPoints;
  
  if (accuracy > 0.95) {
    if (svRatio < 0.3) {
      return `Excellent separation with a compact decision boundary. Only ${svCount} of ${totalPoints} points are support vectors, indicating the kernel finds a simple, generalizable boundary.`;
    } else {
      return `High accuracy achieved, but ${svCount} support vectors suggest a complex boundary. The kernel is using many points to define the decision surface.`;
    }
  } else if (accuracy > 0.8) {
    return `Good classification performance. The kernel captures most of the class structure, though some overlap remains. Consider adjusting kernel parameters to increase separation.`;
  } else if (accuracy > 0.6) {
    return `Moderate accuracy. The kernel provides some separation but the classes have significant overlap in the induced feature space. This suggests the kernel may not be well-suited for this dataset geometry.`;
  } else {
    return `Poor classification. The kernel fails to separate the classes effectively. Try different kernel types or parameters to find a representation where the classes are more distinct.`;
  }
}