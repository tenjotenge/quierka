import React from 'react';
import Plot from 'react-plotly.js';
import { AnalysisSelection } from '../../../core/types';

interface SimilarityPanelProps {
  analysisSelection: AnalysisSelection;
  onNeighborClick: (index: number) => void;
}

export const SimilarityPanel: React.FC<SimilarityPanelProps> = ({ analysisSelection, onNeighborClick }) => {
  const { similarities, neighbors } = analysisSelection;
  
  // Calculate statistics
  const max = Math.max(...similarities);
  const min = Math.min(...similarities);
  const mean = similarities.reduce((a, b) => a + b, 0) / similarities.length;
  const variance = similarities.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / similarities.length;
  
  // To compute median, we need a sorted copy
  const sortedSims = [...similarities].sort((a, b) => a - b);
  const mid = Math.floor(sortedSims.length / 2);
  const median = sortedSims.length % 2 !== 0 ? sortedSims[mid] : (sortedSims[mid - 1] + sortedSims[mid]) / 2;

  // We want top 5 nearest neighbors
  const top5 = neighbors.slice(0, 5);

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '15px', background: '#fcfcfc', border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px' }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Similarity Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
          <div><strong>Max:</strong> {max.toFixed(3)}</div>
          <div><strong>Min:</strong> {min.toFixed(3)}</div>
          <div><strong>Mean:</strong> {mean.toFixed(3)}</div>
          <div><strong>Variance:</strong> {variance.toFixed(3)}</div>
          <div><strong>Median:</strong> {median.toFixed(3)}</div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem' }}>Nearest Neighbors</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            {top5.map((neighborIdx, rank) => (
              <button
                key={neighborIdx}
                onClick={() => onNeighborClick(neighborIdx)}
                style={{
                  padding: '4px 8px',
                  background: '#e0e0e0',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
                title={`Similarity: ${similarities[neighborIdx].toFixed(3)}`}
              >
                #{neighborIdx}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: '300px', height: '150px' }}>
        <Plot
          data={[
            {
              x: similarities,
              type: 'histogram',
              marker: { color: 'rgba(100, 150, 250, 0.7)' },
              nbinsx: 30
            }
          ]}
          layout={{
            margin: { l: 20, r: 20, t: 10, b: 20 },
            width: 300,
            height: 150,
            showlegend: false,
            xaxis: { title: 'Similarity' },
            yaxis: { showticklabels: false },
            shapes: [
              {
                type: 'line',
                x0: mean,
                x1: mean,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: { color: 'red', width: 2, dash: 'dash' }
              },
              {
                type: 'line',
                x0: median,
                x1: median,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: { color: 'green', width: 2, dash: 'dot' }
              }
            ],
            annotations: [
              { x: mean, y: 1, yref: 'paper', text: 'Mean', showarrow: false, yanchor: 'bottom', font: { color: 'red', size: 10 } },
              { x: median, y: 0.8, yref: 'paper', text: 'Median', showarrow: false, yanchor: 'bottom', font: { color: 'green', size: 10 } }
            ]
          }}
          config={{ displayModeBar: false }}
        />
      </div>
    </div>
  );
};
