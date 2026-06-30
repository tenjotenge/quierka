# Quierka Architecture

## Overview

Quierka is organized into three strictly separated layers. Data flows in one direction:

```
Dataset Generation
      │
      ▼
Kernel Engine  ──────────────►  Kernel Matrix  ──►  Cache
      │
      ▼
Analysis Pipeline
      │
      ├──► Spectral Module   ──► spectrum, effective rank, entropy
      │
      ├──► Geometry Module   ──► 2D Kernel PCA embedding
      │
      └──► Selection Module  ──► similarity vector, neighbor ranking
                                  (only when a point is selected)
      │
      ▼
KernelPipelineOutput
      │
      ▼
UI Components  (consume data, produce no analysis)
```

---

## Layer 1: Kernel Engine

**Location:** `src/core/engine/kernelEngine.ts`

**Responsibilities:**
- Accept a `Dataset` and a kernel name.
- Resolve the kernel function from the `kernelRegistry`.
- Compute the symmetric `N × N` kernel matrix.
- Cache results by `(dataset, kernelName, withAnalysis)` hash.
- Delegate post-matrix analysis to `runAnalysisPipeline` when requested.

**Does NOT:**
- Contain analysis logic.
- Know what analyses are performed.
- Have any UI dependencies.

---

## Layer 2: Analysis Pipeline

**Location:** `src/core/analysis/pipeline.ts`

**Responsibilities:**
- Define the `AnalysisModule` interface.
- Maintain a `registeredModules` array (ordered, explicit).
- Execute modules in sequence, accumulating output in a shared `Partial<KernelPipelineOutput>`.
- Expose a single entry point: `runAnalysisPipeline(input)`.

**Does NOT:**
- Contain mathematical logic (that lives in individual module files).
- Know about the UI.
- Perform kernel computation.

### Adding a New Analysis Module

1. Implement `AnalysisModule`:
   ```typescript
   const myModule: AnalysisModule = {
     name: 'my-analysis',
     run(input, output) {
       // read input.matrix, input.selectedIndex
       // write to output.analysis or a new field
     }
   };
   ```
2. Append it to `registeredModules` in `pipeline.ts`.
3. Extend `KernelPipelineOutput` in `pipeline.ts` to include the new field if needed.
4. Extend `KernelComputationResult` or `AnalysisResult` in `types.ts` if the UI should consume the result.

No changes to `App.tsx` or the engine are required for pure analysis additions.

### Registered Modules (as of v0.5)
| Order | Module | Output |
|-------|--------|--------|
| 1 | `spectralModule` | `analysis.spectrum`, `analysis.statistics`, `analysis.interpretation` |
| 2 | `geometryModule` | `analysis.embedding` |
| 3 | `selectionModule` | `selectionAnalysis` (conditional on `selectedIndex`) |

---

## Layer 3: UI

**Location:** `src/ui/`

**Responsibilities:**
- Manage UI state (dataset name, kernel name, selection, interaction mode, color mode, threshold).
- Request kernel computation from `kernelEngine`.
- Request analysis from `runAnalysisPipeline`.
- Render received data via visualization components.

**Does NOT:**
- Perform mathematical computation.
- Contain analysis logic.
- Call eigendecomposition, PCA, or distance functions directly.

### Key Types

| Type | Where used |
|------|-----------|
| `Selection` | UI-level state: which point is selected and from which view |
| `AnalysisSelection` | Analysis output: similarities and neighbor ranking |
| `AnalysisResult` | Analysis output: spectrum, embedding, statistics, interpretation |
| `KernelComputationResult` | Engine output: matrix, metrics, optional analysis |

---

## Design Constraints

- No abstract factories, DI containers, service locators, plugin loading, dynamic imports, or event buses.
- Each layer can be understood independently by a single developer.
- Data flows strictly downward (Core → Pipeline → UI). The UI never calls mathematical functions.
- Future analysis modules (decision boundaries, HSIC, quantum fidelity, noise models) add a file and one line in `pipeline.ts`.
