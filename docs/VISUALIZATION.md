# Visualization Contract

The `/ui` layer of Quierka must be kept as simple as possible. It is strictly a consumer of the `/core` computation.

## Main Components

### 1. Geometry View (Dataset & Kernel PCA)
- **Role**: Builds intuition for how different kernels reshape data geometry.
- **Toggle**: Users can toggle between the original 2D dataset coordinates and the Kernel PCA 2D embedding space.
- **Kernel PCA Embedding**: The kernel similarity matrix is centered and decomposed to extract its leading geometric structure, mapping $N$-dimensional data into a visually interpretable 2D plane. 
- **Future Implication**: This geometric perspective is crucial for evaluating Quantum Kernels. Future quantum feature maps will be visualized here to understand whether the quantum state space provides novel non-linear separation compared to classical kernels.
- **Interaction**: Responds to hover/click events from the app. When a point is selected, the view transitions to similarity coloring or fades low-similarity points based on the active Similarity Radius threshold.

### 2. Kernel Heatmap
- Visualizes the `N x N` kernel matrix `K`.
- Both the X and Y axes represent the indices of the data points.
- The color intensity represents the kernel similarity value `K[i][j]`.
- **Cross-view synchronization**: When a point is selected, semi-transparent yellow bands highlight the corresponding row and column. A red-tinted square marks the diagonal intersection.

### 3. Spectrum View
- Plots the descending eigenvalue spectrum of the kernel matrix.
- Reveals the effective rank and whether variance is concentrated (low-dimensional structure) or dispersed (high-dimensional structure).

### 4. Similarity Panel (Interactive Kernel Explorer)
- Appears when a point is selected. Compact, non-modal, inline.
- **Histogram**: Distribution of `K(selected, xi)` for all `i`. Reference lines for Mean (red) and Median (green) help interpret the distribution shape.
- **Statistics**: Max, Min, Mean, Variance, Median.
- **Nearest Neighbors**: Top 5 ranked neighbors, clickable to transfer selection. Future extensions include multi-select and region brushing.

## Interactive Kernel Explorer
The `Selection` object (with `datasetIndex` and `sourceView`) is the core state primitive driving cross-view synchronization. Its structure is forward-compatible with future features:
- Brushing (multi-select via `Selection[]`)
- Region selection (bounding box in geometry space)
- Comparison mode (two anchored `Selection` objects)

The `AnalysisSelection` object captures `selectedIndex`, `similarities`, and `neighbors`. This object will later be consumed by decision boundary, quantum fidelity, and circuit depth analysis modules.

### Similarity Radius
The Similarity Radius slider controls a threshold `[0, 1]`. Points below the threshold are rendered at reduced opacity (0.2), making the neighborhood structure of the selected point visually explicit. This allows users to directly see "which points does this kernel consider neighbors?"

## Reactivity
The UI reacts seamlessly when the user changes the dataset parameters or the kernel type/parameters. The computation of `computeBatchMatrix` is triggered upon these changes and the state is pushed down to the visualizations.
