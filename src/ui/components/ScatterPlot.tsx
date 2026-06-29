import React from 'react';
import Plot from 'react-plotly.js';
import { Dataset } from '../../core/types';

interface ScatterPlotProps {
  dataset: Dataset;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ dataset }) => {
  const { X, y } = dataset;
  
  // Separate into classes for coloring
  const x0 = X.filter((_, i) => y[i] === 0).map(v => v[0]);
  const y0 = X.filter((_, i) => y[i] === 0).map(v => v[1]);

  const x1 = X.filter((_, i) => y[i] === 1).map(v => v[0]);
  const y1 = X.filter((_, i) => y[i] === 1).map(v => v[1]);

  return (
    <Plot
      data={[
        {
          x: x0,
          y: y0,
          type: 'scatter',
          mode: 'markers',
          marker: { color: 'blue' },
          name: 'Class 0'
        },
        {
          x: x1,
          y: y1,
          type: 'scatter',
          mode: 'markers',
          marker: { color: 'orange' },
          name: 'Class 1'
        }
      ]}
      layout={{ 
        title: 'Dataset Scatter Plot',
        width: 400, 
        height: 400,
        margin: { l: 40, r: 40, t: 40, b: 40 },
        showlegend: false
      }}
      config={{ displayModeBar: false }}
    />
  );
};
