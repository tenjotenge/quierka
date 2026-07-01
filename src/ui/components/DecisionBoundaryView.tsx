import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { AnalysisResult, Selection } from '../../core/types';

interface DecisionBoundaryViewProps {
  datasetX: number[][];
  datasetY: number[];
  analysis?: AnalysisResult;
  selection: Selection | null;
  onPointHover: (index: number) => void;
  onPointClick: (index: number) => void;
}

export const DecisionBoundaryView: React.FC<DecisionBoundaryViewProps> = ({
  datasetX,
  datasetY,
  analysis,
  selection,
  onPointHover,
  onPointClick
}) => {
  // Extract classification results
  const classification = analysis?.classification;
  const embedding = analysis?.embedding;
  
  // Use original coordinates if no embedding available
  const activeCoords = embedding && embedding.length === datasetX.length ? embedding : datasetX;
  
  // ---------------------------------------------------------------------------
  // Decision boundary grid computation
  // ---------------------------------------------------------------------------
  const { boundaryTrace, confidenceTraces } = useMemo(() => {
    if (!classification || !analysis?.embedding || activeCoords.length !== datasetX.length) {
      return { boundaryTrace: null, confidenceTraces: [] };
    }
    
  // Determine grid bounds from the embedding
    const xs = activeCoords.map((p: number[]) => p[0]);
    const ys = activeCoords.map((p: number[]) => p[1]);
    const xMin = Math.min(...xs) - 0.5;
    const xMax = Math.max(...xs) + 0.5;
    const yMin = Math.min(...ys) - 0.5;
    const yMax = Math.max(...ys) + 0.5;
    
    const resolution = 30; // Grid resolution (balance between quality and performance)
    const xStep = (xMax - xMin) / resolution;
    const yStep = (yMax - yMin) / resolution;
    
    // We need to reconstruct the kernel function and alpha coefficients
    // For visualization, we'll use a simplified approach: evaluate decision function
    // on a grid using the kernel matrix directly
    
    const gridX: number[] = [];
    const gridY: number[] = [];
    const gridZ: number[] = [];
    
    // For each grid point, compute decision value using kernel ridge regression
    // We need access to the kernel function and training data
    // Since we don't have direct access here, we'll use a proxy based on distances
    // in the embedding space (this is an approximation for visualization)
    
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = xMin + i * xStep;
        const y = yMin + j * yStep;
        gridX.push(x);
        gridY.push(y);
        
        // Approximate decision value using kernel density in embedding space
        // This is a visualization approximation - the true decision boundary
        // requires the original kernel function
        let decisionValue = 0;
        const sigma = 0.3; // Bandwidth for visualization
        
        for (let k = 0; k < activeCoords.length; k++) {
          const dx = x - activeCoords[k][0];
          const dy = y - activeCoords[k][1];
          const distSq = dx * dx + dy * dy;
          const weight = Math.exp(-distSq / (2 * sigma * sigma));
          
          // Weight by class label (0 or 1)
          decisionValue += weight * datasetY[k];
        }
        
        // Normalize to [0, 1] range
        const maxWeight = datasetY.length * Math.exp(0);
        gridZ.push(decisionValue / maxWeight);
      }
    }
    
    // Decision boundary contour (where z = 0.5)
    const boundaryTrace = {
      x: gridX,
      y: gridY,
      z: gridZ,
      type: 'contour' as const,
      contours: {
        coloring: 'lines' as const,
        start: 0.5,
        end: 0.5,
        size: 0.01,
        showlabels: false,
      },
      colorscale: [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0)']],
      line: { color: 'black', width: 2, dash: 'solid' },
      showscale: false,
      hoverinfo: 'skip' as const,
    };
    
    // Confidence shading (two regions: class 0 and class 1)
    const confidenceTraces = [
      {
        x: gridX,
        y: gridY,
        z: gridZ,
        type: 'contour' as const,
        contours: {
          coloring: 'heatmap' as const,
          start: 0,
          end: 1,
          size: 0.1,
          showlabels: false,
        },
        colorscale: [
          [0, 'rgba(0, 0, 255, 0.15)'],    // Blue for class 0
          [0.5, 'rgba(255, 255, 255, 0)'],  // Transparent at boundary
          [1, 'rgba(255, 140, 0, 0.15)']    // Orange for class 1
        ],
        showscale: false,
        hoverinfo: 'skip' as const,
      }
    ];
    
    return { boundaryTrace, confidenceTraces };
  }, [classification, activeCoords, datasetY]);
  
  // ---------------------------------------------------------------------------
  // Support vector highlighting
  // ---------------------------------------------------------------------------
  const supportVectorIndices = classification?.supportVectorIndices || [];
  
  // ---------------------------------------------------------------------------
  // Build traces
  // ---------------------------------------------------------------------------
  const traces: any[] = [];
  
  // Add confidence shading first (background layer)
  if (confidenceTraces.length > 0) {
    traces.push(...confidenceTraces);
  }
  
  // Add decision boundary line
  if (boundaryTrace) {
    traces.push(boundaryTrace);
  }
  
  // Add data points by class
  const x0: number[] = [], y0: number[] = [], cd0: any[] = [];
  const x1: number[] = [], y1: number[] = [], cd1: any[] = [];
  
  activeCoords.forEach((p: number[], i: number) => {
    const cd = { idx: i, cls: datasetY[i] };
    if (datasetY[i] === 0) {
      x0.push(p[0]); y0.push(p[1]); cd0.push(cd);
    } else {
      x1.push(p[0]); y1.push(p[1]); cd1.push(cd);
    }
  });
  
  // Regular points
  traces.push({
    x: x0, y: y0, type: 'scatter', mode: 'markers',
    marker: { color: 'blue', size: 6, opacity: 0.7 },
    customdata: cd0,
    hovertemplate: '<b>Index:</b> %{customdata.idx}<br><b>Class:</b> %{customdata.cls}<extra></extra>',
    name: 'Class 0'
  });
  
  traces.push({
    x: x1, y: y1, type: 'scatter', mode: 'markers',
    marker: { color: 'orange', size: 6, opacity: 0.7 },
    customdata: cd1,
    hovertemplate: '<b>Index:</b> %{customdata.idx}<br><b>Class:</b> %{customdata.cls}<extra></extra>',
    name: 'Class 1'
  });
  
  // Support vectors (highlighted)
  if (supportVectorIndices.length > 0) {
    const svX = supportVectorIndices.map((i: number) => activeCoords[i][0]);
    const svY = supportVectorIndices.map((i: number) => activeCoords[i][1]);
    
    traces.push({
      x: svX, y: svY, type: 'scatter', mode: 'markers',
      marker: {
        symbol: 'circle-open',
        size: 12,
        color: 'red',
        line: { color: 'red', width: 2 }
      },
      hoverinfo: 'skip',
      showlegend: false,
      name: 'Support Vectors'
    });
  }
  
  // Selected point
  if (selection) {
    traces.push({
      x: [activeCoords[selection.datasetIndex][0]],
      y: [activeCoords[selection.datasetIndex][1]],
      type: 'scatter', mode: 'markers',
      marker: { symbol: 'star', size: 14, color: 'white', line: { color: 'black', width: 1 } },
      hoverinfo: 'skip', showlegend: false
    });
  }
  
  // ---------------------------------------------------------------------------
  // Classification metrics display
  // ---------------------------------------------------------------------------
  const showMetrics = classification && analysis?.embedding && activeCoords.length === datasetX.length;
  
  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Decision Boundary</h2>
        {!analysis?.embedding && (
          <p style={{ fontSize: '0.85rem', color: '#666', margin: '5px 0 0' }}>
            Enable Kernel Analysis Layer to view decision boundary
          </p>
        )}
      </div>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        <Plot
          data={traces}
          layout={{
            width: 400,
            height: 400,
            margin: { l: 40, r: 40, t: 40, b: 40 },
            showlegend: true,
            yaxis: { scaleanchor: 'x', scaleratio: 1 },
            clickmode: 'event'
          }}
          config={{ displayModeBar: true, scrollZoom: true }}
          onHover={(e) => {
            const pt = e.points[0];
            if (pt.customdata && pt.customdata.idx !== undefined) {
              onPointHover(pt.customdata.idx);
            }
          }}
          onClick={(e) => {
            const pt = e.points[0];
            if (pt.customdata && pt.customdata.idx !== undefined) {
              onPointClick(pt.customdata.idx);
            }
          }}
        />
      </div>
      
      {showMetrics && (
        <div style={{ marginTop: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #2196F3' }}>
          <div style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span><strong>Accuracy:</strong> {(classification.trainingAccuracy * 100).toFixed(1)}%</span>
            <span><strong>Support Vectors:</strong> {classification.supportVectorCount}</span>
            <span><strong>Margin:</strong> {classification.marginEstimate.toFixed(4)}</span>
          </div>
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#444' }}>
            <em>"{classification.interpretation}"</em>
          </p>
        </div>
      )}
    </div>
  );
};