import React from 'react';
import Plot from 'react-plotly.js';
import { Dataset, AnalysisSelection, Selection } from '../../core/types';

interface ScatterPlotProps {
  dataset: Dataset;
  selection: Selection | null;
  analysisSelection: AnalysisSelection | null;
  colorBy: 'class' | 'similarity';
  similarityThreshold: number;
  onPointHover: (index: number) => void;
  onPointClick: (index: number) => void;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ 
  dataset, 
  selection, 
  analysisSelection, 
  colorBy,
  similarityThreshold,
  onPointHover,
  onPointClick
}) => {
  const { X, y } = dataset;
  
  const handleHover = (e: any) => {
    if (e.points && e.points.length > 0) {
      onPointHover(e.points[0].pointIndex);
    }
  };

  const handleClick = (e: any) => {
    if (e.points && e.points.length > 0) {
      onPointClick(e.points[0].pointIndex);
    }
  };

  // Build the traces based on colorBy and selection state
  let traces: any[] = [];

  // Determine opacities based on threshold if a point is selected
  const getOpacities = () => {
    if (!analysisSelection || colorBy !== 'similarity') return Array(X.length).fill(1);
    return analysisSelection.similarities.map(sim => sim >= similarityThreshold ? 1 : 0.2);
  };

  const getCustomData = () => {
    if (!analysisSelection) return Array(X.length).fill({});
    
    return X.map((_, i) => {
      const sim = analysisSelection.similarities[i];
      const rank = analysisSelection.neighbors.indexOf(i) + 1; // 1-based rank
      return { sim, rank: rank > 0 ? rank : 'Self' };
    });
  };

  const customData = getCustomData();
  const opacities = getOpacities();
  
  // Tooltip template
  const hoverTemplate = analysisSelection
    ? '<b>Index:</b> %{pointIndex}<br>' +
      '<b>Similarity:</b> %{customdata.sim:.3f}<br>' +
      '<b>Distance Rank:</b> %{customdata.rank}<extra></extra>'
    : '<b>Index:</b> %{pointIndex}<br><b>Class:</b> %{customdata.cls}<extra></extra>';

  if (colorBy === 'class' || !analysisSelection) {
    // Categorical coloring
    const x0: number[] = []; const y0: number[] = []; const op0: number[] = []; const cd0: any[] = [];
    const x1: number[] = []; const y1: number[] = []; const op1: number[] = []; const cd1: any[] = [];
    
    X.forEach((v, i) => {
      const cd = analysisSelection ? { ...customData[i], idx: i } : { cls: y[i], idx: i };
      if (y[i] === 0) {
        x0.push(v[0]); y0.push(v[1]); op0.push(opacities[i]); cd0.push(cd);
      } else {
        x1.push(v[0]); y1.push(v[1]); op1.push(opacities[i]); cd1.push(cd);
      }
    });

    traces.push({
      x: x0, y: y0, type: 'scatter', mode: 'markers',
      marker: { color: 'blue', opacity: op0 },
      customdata: cd0,
      hovertemplate: hoverTemplate,
      name: 'Class 0'
    });
    traces.push({
      x: x1, y: y1, type: 'scatter', mode: 'markers',
      marker: { color: 'orange', opacity: op1 },
      customdata: cd1,
      hovertemplate: hoverTemplate,
      name: 'Class 1'
    });
  } else {
    // Continuous coloring
    const xAll = X.map(v => v[0]);
    const yAll = X.map(v => v[1]);
    const cdAll = customData.map((cd, i) => ({ ...cd, idx: i }));
    
    traces.push({
      x: xAll, y: yAll, type: 'scatter', mode: 'markers',
      marker: { 
        color: analysisSelection.similarities, 
        colorscale: 'Viridis',
        opacity: opacities,
        showscale: true,
        colorbar: { title: 'Similarity', thickness: 15 }
      },
      customdata: cdAll,
      hovertemplate: hoverTemplate,
      name: 'Dataset'
    });
  }

  // Highlight selected point
  if (analysisSelection) {
    const sIdx = analysisSelection.selectedIndex;
    traces.push({
      x: [X[sIdx][0]],
      y: [X[sIdx][1]],
      type: 'scatter',
      mode: 'markers',
      marker: { symbol: 'star', size: 14, color: 'white', line: { color: 'black', width: 1 } },
      hoverinfo: 'skip',
      showlegend: false
    });
  }

  return (
    <Plot
      data={traces}
      layout={{ 
        title: 'Dataset Scatter Plot',
        width: 400, 
        height: 400,
        margin: { l: 40, r: 40, t: 40, b: 40 },
        showlegend: colorBy === 'class' || !analysisSelection,
        clickmode: 'event'
      }}
      config={{ displayModeBar: false }}
      onHover={(e) => {
         const pt = e.points[0];
         if (pt.customdata && pt.customdata.idx !== undefined) onPointHover(pt.customdata.idx);
      }}
      onClick={(e) => {
         const pt = e.points[0];
         if (pt.customdata && pt.customdata.idx !== undefined) onPointClick(pt.customdata.idx);
      }}
    />
  );
};
