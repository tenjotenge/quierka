import { KernelFunction } from '../types';

// Utility for dot product
function dotProduct(x: number[], y: number[]): number {
  return x.reduce((sum, xi, i) => sum + xi * y[i], 0);
}

// Utility for squared euclidean distance
function sqEuclideanDist(x: number[], y: number[]): number {
  return x.reduce((sum, xi, i) => sum + Math.pow(xi - y[i], 2), 0);
}

// 1. Linear Kernel
export const linearKernel: KernelFunction = (x, y) => dotProduct(x, y);

// 2. Polynomial Kernel (degree 3 by default)
export function getPolynomialKernel(degree = 3, gamma = 1, coef0 = 1): KernelFunction {
  return (x, y) => Math.pow(gamma * dotProduct(x, y) + coef0, degree);
}

// 3. RBF (Gaussian) Kernel
export function getRBFKernel(gamma = 1): KernelFunction {
  return (x, y) => Math.exp(-gamma * sqEuclideanDist(x, y));
}

// 4. Quantum-inspired ZZ feature map approximation
export const quantumZZKernel: KernelFunction = (x, y) => {
  let phaseDiff = 0;
  
  // Linear terms
  for (let i = 0; i < x.length; i++) {
    phaseDiff += (x[i] - y[i]);
  }
  
  // ZZ entanglement terms (pairs)
  for (let i = 0; i < x.length; i++) {
    for (let j = i + 1; j < x.length; j++) {
      const zx = (Math.PI - x[i]) * (Math.PI - x[j]);
      const zy = (Math.PI - y[i]) * (Math.PI - y[j]);
      phaseDiff += (zx - zy);
    }
  }

  return Math.pow(Math.cos(phaseDiff), 2);
};
