import { Dataset, KernelComputationResult } from '../types';
import { kernelRegistry } from '../kernels/registry';
import { runAnalysisPipeline } from '../analysis/pipeline';

/**
 * KernelEngine
 *
 * Responsibilities:
 *   - Compute the raw N×N kernel matrix from a dataset and kernel function.
 *   - Cache results by (dataset, kernelName, withAnalysis) hash.
 *   - Delegate all post-matrix analysis to the analysis pipeline.
 *
 * The engine has no knowledge of what specific analyses are performed.
 * That is the pipeline's responsibility.
 */
class KernelEngine {
  private cache: Map<string, KernelComputationResult> = new Map();

  private generateHash(dataset: Dataset, kernelName: string, withAnalysis: boolean): string {
    return JSON.stringify({ X: dataset.X, kernelName, withAnalysis });
  }

  computeBatchMatrix(
    dataset: Dataset,
    kernelName: string,
    withAnalysis: boolean = false
  ): KernelComputationResult {
    const hash = this.generateHash(dataset, kernelName, withAnalysis);

    if (this.cache.has(hash)) {
      console.log(`[KernelEngine] Cache hit: ${kernelName}, n=${dataset.X.length}`);
      return this.cache.get(hash)!;
    }

    console.log(`[KernelEngine] Computing matrix: ${kernelName}, n=${dataset.X.length}...`);

    const start = performance.now();
    const kernelFunc = kernelRegistry.getKernel(kernelName);
    const n = dataset.X.length;

    const K: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        const val = kernelFunc(dataset.X[i], dataset.X[j]);
        K[i][j] = val;
        K[j][i] = val;
      }
    }

    const timeMs = performance.now() - start;

    const result: KernelComputationResult = {
      matrix: K,
      metrics: {
        timeMs,
        datasetSize: n,
        kernelName,
        memoryEstimateBytes: n * n * 8,
      },
    };

    if (withAnalysis) {
      const pipelineOutput = runAnalysisPipeline({
        matrix: K,
        datasetX: dataset.X,
        datasetY: dataset.y,
        kernelFunc,
      });
      result.analysis = pipelineOutput.analysis;
    }

    this.cache.set(hash, result);
    console.log(`[KernelEngine] Done in ${timeMs.toFixed(2)}ms.`);
    return result;
  }
}

export const kernelEngine = new KernelEngine();
