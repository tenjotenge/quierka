import { Dataset, KernelComputationResult, AnalysisResult } from '../types';
import { kernelRegistry } from '../kernels/registry';
import { computeSpectralProperties } from '../analysis/spectral';
import { computeKernelPCA } from '../analysis/geometry';

class KernelEngine {
  private cache: Map<string, KernelComputationResult> = new Map();

  private generateHash(dataset: Dataset, kernelName: string, withAnalysis: boolean): string {
    return JSON.stringify({ X: dataset.X, kernelName, withAnalysis });
  }

  computeBatchMatrix(dataset: Dataset, kernelName: string, withAnalysis: boolean = false): KernelComputationResult {
    const hash = this.generateHash(dataset, kernelName, withAnalysis);
    
    if (this.cache.has(hash)) {
      console.log(`[KernelEngine] Cache hit for kernel: ${kernelName}, dataset size: ${dataset.X.length}, analysis: ${withAnalysis}`);
      return this.cache.get(hash)!;
    }

    console.log(`[KernelEngine] Computing kernel matrix: ${kernelName}...`);
    
    const start = performance.now();
    const kernelFunc = kernelRegistry.getKernel(kernelName);
    const n = dataset.X.length;
    
    const K: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        const val = kernelFunc(dataset.X[i], dataset.X[j]);
        K[i][j] = val;
        K[j][i] = val; // Symmetric
      }
    }
    
    const end = performance.now();
    const timeMs = end - start;
    const memoryEstimateBytes = n * n * 8;

    const result: KernelComputationResult = {
      matrix: K,
      metrics: {
        timeMs,
        datasetSize: n,
        kernelName,
        memoryEstimateBytes
      }
    };

    if (withAnalysis) {
      const spectralProps = computeSpectralProperties(K);
      const embedding = computeKernelPCA(K, 2);
      
      const analysis: AnalysisResult = {
        spectrum: spectralProps.spectrum,
        embedding: embedding,
        statistics: {
          effectiveRank: spectralProps.effectiveRank,
          entropy: spectralProps.entropy,
          leadingEigenvaluePercentage: spectralProps.leadingEigenvaluePercentage
        },
        interpretation: spectralProps.interpretation
      };
      
      result.analysis = analysis;
    }

    this.cache.set(hash, result);
    
    console.log(`[KernelEngine] Finished ${kernelName} in ${timeMs.toFixed(2)}ms.`);
    return result;
  }
}

export const kernelEngine = new KernelEngine();
