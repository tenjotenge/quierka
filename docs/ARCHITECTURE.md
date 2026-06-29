# Quierka Architecture Overview

Quierka is a kernel visualization and analysis environment. It is designed to evaluate both classical and quantum machine learning kernels.

## High-Level Architecture

The architecture relies on a strict separation of concerns to allow seamless transition to high-performance backends (CUDA/GPU) in the future.

### `/core` (Computation Engine)
- **Role**: Pure computation, zero UI dependencies.
- **Constraints**: Must be deterministic and testable.
- **Components**:
  - `datasets.ts`: Synthetic dataset generators.
  - `kernels.ts`: Kernel functions (Linear, Poly, RBF, Quantum ZZ) and batch kernel matrix computation.
  - `types.ts`: Core data structures and interfaces.

### `/ui` (Presentation Layer)
- **Role**: React frontend for interacting with `/core` and displaying results.
- **Constraints**: No business logic, no heavy frameworks, minimal state management.
- **Components**:
  - `ScatterPlot`: Displays 2D datasets.
  - `Heatmap`: Displays the computed kernel matrix.
  - `Controls`: UI for selecting datasets and kernels.

## Future-Proofing
The `/core` module currently runs synchronously in TypeScript for the v0.1 prototype. In the future, this module can be replaced with an asynchronous API client communicating with a Python/C++ backend that leverages CUDA or Qiskit/Pennylane, without requiring any changes to the `/ui` layer architecture beyond handling asynchronous responses.
