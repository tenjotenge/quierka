# Agent Notes

This file contains meta-instructions and context for AI agents working on the Quierka codebase.

## Core Directives
1. **No unnecessary abstractions**: Do not over-engineer the codebase. If a simple array loop suffices, use it. Do not introduce complex class hierarchies for the core math.
2. **Strict separation of concerns**: Keep `/core` absolutely free of React/DOM or browser-specific references. It must remain pure TS/JS.
3. **No extra dependencies**: If a matrix math operation is simple (e.g., dot product, Euclidean distance), write it out. Do not pull in heavy math libraries unless explicitly approved.
4. **Formatting**: Ensure you are updating `task.md` and using the right markdown conventions when modifying code.
5. **GPU Future**: The goal is to eventually offload the `computeKernelMatrix` logic to an external GPU worker or a Python backend. Design your additions keeping in mind that the computation layer will one day run entirely off-device.

## Iteration 3: Spectral Geometry Layer - Decision Structure
1. **Lightweight Numeric Library**: `ml-matrix` was introduced in Iteration 3 strictly for `EigenvalueDecomposition`. This adheres to the rule of avoiding heavy ML frameworks while solving the complex issue of computing eigenvalues in pure TypeScript.
2. **Effective Rank Definition**: The effective rank of a kernel matrix is defined numerically as $\exp(H)$, where $H$ is the Shannon Entropy of the normalized eigenvalues. This provides a stable scalar representation of the dimensionality of the feature space induced by the kernel.
3. **Spectrum Opt-in**: Eigenvalue decomposition scales at $O(N^3)$, which can be slow for large datasets. Therefore, spectral properties are computed strictly on an opt-in basis via the `withSpectrum` parameter in `computeBatchMatrix`, ensuring the core engine defaults remain fast.
