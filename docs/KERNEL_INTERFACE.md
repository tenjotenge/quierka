# Kernel Interface Specification

All kernels must conform to a strict interface to ensure interoperability and ease of batch matrix computation.

## Unified Kernel Signature
Every kernel function must match the `KernelFunction` type:

```typescript
type KernelFunction = (x: number[], y: number[]) => number;
```

- `x`: A vector representing a single data point.
- `y`: A vector representing another single data point.
- **Returns**: A scalar representing the similarity between `x` and `y`.

## Batch Matrix Computation
To compute a full kernel matrix for a dataset, a unified batch function must be used:

```typescript
function computeKernelMatrix(X: number[][], kernel: KernelFunction): number[][]
```

- `X`: An array of data points (each point is an array of numbers).
- `kernel`: The unified kernel function.
- **Returns**: An `N x N` symmetric matrix, where `M[i][j] = kernel(X[i], X[j])`.

## Supported Kernels (v0.1)
1. **Linear**: `k(x, y) = x^T y`
2. **Polynomial**: `k(x, y) = (gamma * x^T y + coef0)^degree`
3. **RBF (Gaussian)**: `k(x, y) = exp(-gamma * ||x - y||^2)`
4. **Quantum ZZ (Simulated)**: A simplified proxy for a quantum ZZ feature map kernel.
