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

## Decision Boundary View
The Decision Boundary View visualizes kernel-based classification results when the Kernel Analysis Layer is enabled. It appears alongside the existing visualizations and reinforces the connection between kernel geometry and separability.

### What It Shows
- **Decision Boundary**: A black contour line representing where the kernel classifier predicts a class change (decision value = 0.5).
- **Confidence Shading**: Subtle blue/orange regions indicating the classifier's confidence in each class assignment.
- **Support Vectors**: Red open circles highlighting training points that define the decision boundary (points with non-zero dual coefficients in the kernel ridge regression solution).
- **Data Points**: Blue (Class 0) and orange (Class 1) markers showing the original dataset.

### Relationship to Kernel Matrix
The decision boundary is computed using kernel ridge regression on the same kernel matrix visualized in the heatmap. This creates a direct link between:
- **Kernel Matrix**: Encodes pairwise similarities between all points
- **Decision Boundary**: Shows how those similarities combine to separate classes in the feature space

### How Geometry Influences the Boundary
The boundary is visualized in the Kernel PCA embedding space (when available), which reveals how the kernel's induced geometry affects classification:
- **Linear kernels**: Typically produce straight or gently curved boundaries aligned with principal components
- **RBF kernels**: Can produce highly non-linear boundaries that wrap around individual points or clusters
- **Polynomial kernels**: Boundaries reflect the polynomial degree, showing increasing flexibility
- **Quantum-inspired kernels**: May reveal structure that classical kernels miss

### Interaction with Other Views
- **Selection**: Clicking a point in any view highlights it across all visualizations, including the decision boundary view.
- **Kernel Changes**: Switching kernels immediately updates the boundary, showing how different kernels reshape the classification geometry.
- **Dataset Changes**: New datasets trigger recomputation of both the kernel matrix and decision boundary.

### Classification Metrics
When classification is available, the view displays:
- **Training Accuracy**: Percentage of training points correctly classified
- **Support Vector Count**: Number of points actively defining the boundary
- **Margin Estimate**: Minimum distance from any correctly classified point to the boundary
- **Interpretation**: Automated assessment of separation quality based on measured metrics

## Interactive Kernel Explorer
The `Selection` object (with `datasetIndex` and `sourceView`) is the core state primitive driving cross-view synchronization. Its structure is forward-compatible with future features:
- Brushing (multi-select via `Selection[]`)
- Region selection (bounding box in geometry space)
- Comparison mode (two anchored `Selection` objects)

The `AnalysisSelection` object captures `selectedIndex`, `similarities`, and `neighbors`. This object is consumed by the decision boundary view and similarity panel to provide classification context for selected points.

### Similarity Radius
The Similarity Radius slider controls a threshold `[0, 1]`. Points below the threshold are rendered at reduced opacity (0.2), making the neighborhood structure of the selected point visually explicit. This allows users to directly see "which points does this kernel consider neighbors?"

## Reactivity
The UI reacts seamlessly when the user changes the dataset parameters or the kernel type/parameters. The computation of `computeBatchMatrix` is triggered upon these changes and the state is pushed down to the visualizations.
