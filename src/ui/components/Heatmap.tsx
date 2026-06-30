import React from 'react';
import Plot from 'react-plotly.js';

interface HeatmapProps {
  kernelMatrix: number[][];
  selectedPointIndex?: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ kernelMatrix, selectedPointIndex }) => {
  const n = kernelMatrix.length;

  // Build semi-transparent row/col highlight shapes
  const shapes: any[] = [];
  if (selectedPointIndex !== undefined) {
    const i = selectedPointIndex;
    // Highlighted row band
    shapes.push({
      type: 'rect',
      x0: -0.5, x1: n - 0.5,
      y0: i - 0.5, y1: i + 0.5,
      fillcolor: 'rgba(255, 255, 0, 0.2)',
      line: { width: 0 }
    });
    // Highlighted column band
    shapes.push({
      type: 'rect',
      x0: i - 0.5, x1: i + 0.5,
      y0: -0.5, y1: n - 0.5,
      fillcolor: 'rgba(255, 255, 0, 0.2)',
      line: { width: 0 }
    });
    // Intersection crosshair center — full border
    shapes.push({
      type: 'rect',
      x0: i - 0.5, x1: i + 0.5,
      y0: i - 0.5, y1: i + 0.5,
      fillcolor: 'rgba(255, 80, 80, 0.4)',
      line: { color: 'red', width: 1 }
    });
  }

  return (
    <Plot
      data={[
        {
          z: kernelMatrix,
          type: 'heatmap',
          colorscale: 'Viridis'
        }
      ]}
      layout={{ 
        title: 'Kernel Matrix Heatmap',
        width: 400, 
        height: 400,
        margin: { l: 40, r: 40, t: 40, b: 40 },
        shapes
      }}
      config={{ displayModeBar: false }}
    />
  );
};
