# Datasets Specification

Quierka includes a built-in synthetic dataset generator for generating 2D datasets primarily used for evaluating kernel separation capabilities.

## Dataset Output Format
All dataset generators must return an object conforming to the `Dataset` interface:

```typescript
interface Dataset {
  X: number[][]; // Array of shape [N, 2] containing the 2D coordinates
  y: number[];   // Array of shape [N] containing class labels (usually 0 or 1)
}
```

## Generators
The `src/core/datasets.ts` module exposes the following generator functions:

1. `makeMoons(n_samples: number, noise?: number): Dataset`
2. `makeCircles(n_samples: number, noise?: number, factor?: number): Dataset`
3. `makeBlobs(n_samples: number, centers?: number, cluster_std?: number): Dataset`
4. `makeSpiral(n_samples: number, noise?: number): Dataset`

## Constraints
- Datasets should be deterministic (or pseudo-random with fixed seeds in future versions to ensure reproducibility).
- The returned `X` values should typically be normalized or centered around the origin to ensure stable kernel evaluation.
