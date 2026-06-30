import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { AnalysisResult, AnalysisSelection, Selection } from '../../../core/types';

interface GeometryViewProps {
  originalDatasetX: number[][];
  datasetY: number[];
  analysis?: AnalysisResult;
  selection: Selection | null;
  analysisSelection: AnalysisSelection | null;
  colorBy: 'class' | 'similarity';
  similarityThreshold: number;
  onPointHover: (index: number) => void;
  onPointClick: (index: number) => void;
}

export const GeometryView: React.FC<GeometryViewProps> = ({ 
  originalDatasetX, 
  datasetY, 
  analysis,
  selection,
  analysisSelection,
  colorBy,
  similarityThreshold,
  onPointHover,
  onPointClick
}) => {
  const [showKernelGeometry, setShowKernelGeometry] = useState(false);

  // Fallback to original dataset if no embedding is available
  const activeEmbedding = (showKernelGeometry && analysis?.embedding) ? analysis.embedding : originalDatasetX;

  const N = activeEmbedding.length;
  let traces: any[] = [];

  const getOpacities = () => {
    if (!analysisSelection || colorBy !== 'similarity') return Array(N).fill(1);
    return analysisSelection.similarities.map(sim => sim >= similarityThreshold ? 1 : 0.2);
  };

  const getCustomData = () => {
    if (!analysisSelection) return Array(N).fill({});
    return activeEmbedding.map((_, i) => {
      const sim = analysisSelection.similarities[i];
      const rank = analysisSelection.neighbors.indexOf(i) + 1;
      return { sim, rank: rank > 0 ? rank : 'Self' };
    });
  };

  const customData = getCustomData();
  const opacities = getOpacities();
  
  const hoverTemplate = analysisSelection
    ? '<b>Index:</b> %{customdata.idx}<br>' +
      '<b>Similarity:</b> %{customdata.sim:.3f}<br>' +
      '<b>Distance Rank:</b> %{customdata.rank}<extra></extra>'
    : '<b>Index:</b> %{customdata.idx}<br><b>Class:</b> %{customdata.cls}<extra></extra>';

  if (colorBy === 'class' || !analysisSelection) {
    const x0: number[] = []; const y0: number[] = []; const op0: number[] = []; const cd0: any[] = [];
    const x1: number[] = []; const y1: number[] = []; const op1: number[] = []; const cd1: any[] = [];
    
    activeEmbedding.forEach((v, i) => {
      const cd = analysisSelection ? { ...customData[i], idx: i } : { cls: datasetY[i], idx: i };
      if (datasetY[i] === 0) {
        x0.push(v[0]); y0.push(v[1]); op0.push(opacities[i]); cd0.push(cd);
      } else {
        x1.push(v[0]); y1.push(v[1]); op1.push(opacities[i]); cd1.push(cd);
      }
    });

    traces.push({
      x: x0, y: y0, type: 'scatter', mode: 'markers',
      marker: { color: 'blue', opacity: op0 },
      customdata: cd0, hovertemplate: hoverTemplate, name: 'Class 0'
    });
    traces.push({
      x: x1, y: y1, type: 'scatter', mode: 'markers',
      marker: { color: 'orange', opacity: op1 },
      customdata: cd1, hovertemplate: hoverTemplate, name: 'Class 1'
    });
  } else {
    const xAll = activeEmbedding.map(v => v[0]);
    const yAll = activeEmbedding.map(v => v[1]);
    const cdAll = customData.map((cd, i) => ({ ...cd, idx: i }));
    
    traces.push({
      x: xAll, y: yAll, type: 'scatter', mode: 'markers',
      marker: { 
        color: analysisSelection.similarities, 
        colorscale: 'Viridis', opacity: opacities, showscale: true,
        colorbar: { title: 'Similarity', thickness: 15 }
      },
      customdata: cdAll, hovertemplate: hoverTemplate, name: 'Geometry'
    });
  }

  if (analysisSelection) {
    const sIdx = analysisSelection.selectedIndex;
    traces.push({
      x: [activeEmbedding[sIdx][0]],
      y: [activeEmbedding[sIdx][1]],
      type: 'scatter', mode: 'markers',
      marker: { symbol: 'star', size: 14, color: 'white', line: { color: 'black', width: 1 } },
      hoverinfo: 'skip', showlegend: false
    });
  }

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
          data={traces}
          layout={{ 
            width: 400, height: 400, margin: { l: 40, r: 40, t: 40, b: 40 },
            showlegend: colorBy === 'class' || !analysisSelection,
            yaxis: { scaleanchor: 'x', scaleratio: 1 }, clickmode: 'event'
          }}
          config={{ displayModeBar: true, scrollZoom: true }}
          onHover={(e) => {
             const pt = e.points[0];
             if (pt.customdata && pt.customdata.idx !== undefined) onPointHover(pt.customdata.idx);
          }}
          onClick={(e) => {
             const pt = e.points[0];
             if (pt.customdata && pt.customdata.idx !== undefined) onPointClick(pt.customdata.idx);
          }}
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
