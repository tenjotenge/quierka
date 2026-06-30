# Visualization Contract

The `/ui` layer of Quierka must be kept as simple as possible. It is strictly a consumer of the `/core` computation.

## Main Components

### 1. Geometry View (Dataset & Kernel PCA)
- **Role**: Builds intuition for how different kernels reshape data geometry.
- **Toggle**: Users can toggle between the original 2D dataset coordinates and the Kernel PCA 2D embedding space.
- **Kernel PCA Embedding**: The kernel similarity matrix is centered and decomposed to extract its leading geometric structure, mapping $N$-dimensional data into a visually interpretable 2D plane. 
- **Future Implication**: This geometric perspective is crucial for evaluating Quantum Kernels. Future quantum feature maps will be visualized here to understand whether the quantum state space provides novel non-linear separation compared to classical kernels.

### 2. Kernel Heatmap
- Visualizes the `N x N` kernel matrix `K`.
- Both the X and Y axes represent the indices of the data points.
- The color intensity represents the kernel similarity value `K[i][j]`.
- Sorting the dataset by label `y` before computing the matrix is recommended to visually expose intra-class vs inter-class similarities.

### 3. Spectrum View
- Plots the descending eigenvalue spectrum of the kernel matrix.
- Reveals the effective rank and whether variance is concentrated (low-dimensional structure) or dispersed (high-dimensional structure).

## Reactivity
The UI must react seamlessly when the user changes the dataset parameters or the kernel type/parameters. The computation of `computeBatchMatrix` is triggered upon these changes and the state is pushed down to the visualizations.
