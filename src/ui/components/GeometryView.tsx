import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { AnalysisResult } from '../../../core/types';

interface GeometryViewProps {
  originalDatasetX: number[][];
  datasetY: number[];
  analysis?: AnalysisResult;
}

export const GeometryView: React.FC<GeometryViewProps> = ({ originalDatasetX, datasetY, analysis }) => {
  const [showKernelGeometry, setShowKernelGeometry] = useState(false);

  // Fallback to original dataset if no embedding is available
  const activeEmbedding = (showKernelGeometry && analysis?.embedding) ? analysis.embedding : originalDatasetX;

  const x0 = activeEmbedding.filter((_, i) => datasetY[i] === 0).map(v => v[0]);
  const y0 = activeEmbedding.filter((_, i) => datasetY[i] === 0).map(v => v[1]);

  const x1 = activeEmbedding.filter((_, i) => datasetY[i] === 1).map(v => v[0]);
  const y1 = activeEmbedding.filter((_, i) => datasetY[i] === 1).map(v => v[1]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Geometry View</h2>
        <label style={{ fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input 
            type="checkbox" 
            checked={showKernelGeometry} 
            onChange={(e) => setShowKernelGeometry(e.target.checked)} 
            disabled={!analysis?.embedding}
          />
          Show Kernel PCA
        </label>
      </div>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
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
            width: 400, 
            height: 400,
            margin: { l: 40, r: 40, t: 40, b: 40 },
            showlegend: false,
            yaxis: { scaleanchor: 'x', scaleratio: 1 } // Equal axis scaling
          }}
          config={{ displayModeBar: true, scrollZoom: true }}
        />
      </div>

      {analysis && (
        <div style={{ marginTop: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #4CAF50' }}>
          <div style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Effective Rank:</strong> {analysis.statistics.effectiveRank.toFixed(2)}</span>
            <span><strong>Entropy:</strong> {analysis.statistics.entropy.toFixed(2)}</span>
            <span><strong>Leading EV:</strong> {(analysis.statistics.leadingEigenvaluePercentage * 100).toFixed(1)}%</span>
          </div>
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#444' }}>
            <em>"{analysis.interpretation}"</em>
          </p>
        </div>
      )}
    </div>
  );
};
