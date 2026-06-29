import React from 'react';
import Plot from 'react-plotly.js';

interface HeatmapProps {
  kernelMatrix: number[][];
}

export const Heatmap: React.FC<HeatmapProps> = ({ kernelMatrix }) => {
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
        margin: { l: 40, r: 40, t: 40, b: 40 }
      }}
      config={{ displayModeBar: false }}
    />
  );
};
