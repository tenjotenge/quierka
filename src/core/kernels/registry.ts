import { KernelDefinition, KernelFunction } from '../types';
import { linearKernel, getPolynomialKernel, getRBFKernel, quantumZZKernel } from './implementations';

class KernelRegistry {
  private kernels: Map<string, KernelDefinition> = new Map();

  constructor() {
    // Auto-register default kernels
    this.registerKernel({
      name: 'linear',
      func: linearKernel,
      description: 'Standard Linear Kernel'
    });
    this.registerKernel({
      name: 'polynomial',
      func: getPolynomialKernel(3, 1, 1),
      description: 'Polynomial Kernel (degree 3)'
    });
    this.registerKernel({
      name: 'rbf',
      func: getRBFKernel(1.0),
      description: 'RBF Gaussian Kernel'
    });
    this.registerKernel({
      name: 'quantum',
      func: quantumZZKernel,
      description: 'Quantum-Inspired ZZ Kernel'
    });
  }

  registerKernel(def: KernelDefinition): void {
    if (this.kernels.has(def.name)) {
      console.warn(`Kernel ${def.name} is already registered. Overwriting.`);
    }
    this.kernels.set(def.name, def);
  }

  getKernel(name: string): KernelFunction {
    const def = this.kernels.get(name);
    if (!def) {
      throw new Error(`Kernel '${name}' not found in registry.`);
    }
    return def.func;
  }

  listKernels(): string[] {
    return Array.from(this.kernels.keys());
  }
}

export const kernelRegistry = new KernelRegistry();
