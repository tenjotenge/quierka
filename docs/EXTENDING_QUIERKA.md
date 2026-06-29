# Extending Quierka

Quierka is built to be easily extensible. Follow this guide when adding new features.

## 1. Adding a New Dataset
1. Open `src/core/datasets.ts`.
2. Implement your dataset generator function returning a `Dataset` object (`{ X: number[][], y: number[] }`).
3. Open the UI controls component (`src/ui/components/Controls.tsx`) and add the new dataset to the selection dropdown.

## 2. Adding a New Kernel
1. Open `src/core/kernels.ts`.
2. Implement your kernel logic. It must accept two parameters `(x: number[], y: number[])` and return a scalar `number`.
3. If it requires hyper-parameters (e.g., `gamma`), consider passing them via closure or extending the generic kernel selection UI.
4. Add the new kernel to the `kernels` mapping exposed to the UI layer.

## 3. Future CUDA / Backend Integration
When swapping out the local synchronous kernel computation for a GPU backend:
1. Update `src/core/kernels.ts` to export an asynchronous version of `computeKernelMatrix`.
2. The new `computeKernelMatrix` function will send the `X` payload and the kernel identifier to the backend via a REST/WebSocket API.
3. Update the UI to handle the asynchronous `Promise` (add a loading state). No other UI architectural changes should be required.
