# Quierka

Quierka is a Kernel Visualization and Analysis Workbench designed for evaluating both classical and quantum machine learning kernels.

## Overview
Quierka provides a deterministic, UI-agnostic computation engine to generate synthetic datasets, compute kernel matrices, and visualize their separation properties via scatter plots and heatmaps.

### Features
- **Datasets**: Moons, Circles, Gaussian Blobs, Spirals.
- **Kernels**: Linear, Polynomial, RBF (Gaussian), Quantum-inspired ZZ.
- **Visualization**: Dataset scatter plots and Kernel Matrix heatmaps.

## Architecture
The repository is split into two primary domains:
- `/core`: Pure computation logic. Generates datasets and computes kernel matrices. Zero dependencies on the UI or DOM.
- `/ui`: React presentation layer. Consumes the core engine to render visualizations.

This strict separation ensures that Quierka can easily swap its local synchronous TS engine for an asynchronous GPU/CUDA backend in the future without refactoring the UI.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the workbench.

## Extending Quierka
To add new kernels or datasets, refer to the documentation in `/docs`. The `/docs` folder contains extensive, agent-ready architectural notes and interfaces.
