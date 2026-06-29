# Visualization Contract

The `/ui` layer of Quierka must be kept as simple as possible. It is strictly a consumer of the `/core` computation.

## Main Components

### 1. Scatter Plot
- Plots the dataset features `X[i][0]` vs `X[i][1]`.
- Points are colored based on the label `y[i]`.
- Designed to visualize class distribution and non-linear separability.

### 2. Kernel Heatmap
- Visualizes the `N x N` kernel matrix `K`.
- Both the X and Y axes represent the indices of the data points.
- The color intensity represents the kernel similarity value `K[i][j]`.
- Sorting the dataset by label `y` before computing the matrix is recommended to visually expose intra-class vs inter-class similarities.

## Reactivity
The UI must react seamlessly when the user changes the dataset parameters or the kernel type/parameters. The computation of `computeKernelMatrix` is triggered upon these changes and the state is pushed down to the visualizations.
