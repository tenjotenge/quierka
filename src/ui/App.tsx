'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { Controls } from './components/Controls';
import { ScatterPlot } from './components/ScatterPlot';
import { Heatmap } from './components/Heatmap';
import { SpectrumView } from './components/SpectrumView';
import { GeometryView } from './components/GeometryView';
import { SimilarityPanel } from './components/SimilarityPanel';
import { SensitivityView } from './components/SensitivityView';
import { DecisionBoundaryView } from './components/DecisionBoundaryView';

import { makeMoons, makeCircles, makeBlobs, makeSpiral } from '../core/datasets';
import { kernelEngine } from '../core/engine/kernelEngine';
import { runAnalysisPipeline } from '../core/analysis/pipeline';
import { Selection, AnalysisSelection } from '../core/types';

export default function App() {
  // --- Dataset & kernel selection ---
  const [datasetName, setDatasetName] = useState('moons');
  const [kernelName, setKernelName] = useState('rbf');
  const [showAnalysis, setShowAnalysis] = useState(false);

  // --- Interaction state ---
  const [selection, setSelection] = useState<Selection | null>(null);
  const [interactionMode, setInteractionMode] = useState<'hover' | 'click'>('hover');
  const [colorBy, setColorBy] = useState<'class' | 'similarity'>('class');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.5);

  // --- Data generation ---
  const dataset = useMemo(() => {
    switch (datasetName) {
      case 'circles': return makeCircles(150, 0.1, 0.5);
      case 'blobs':   return makeBlobs(150, 2, 0.6);
      case 'spiral':  return makeSpiral(150, 0.1);
      default:        return makeMoons(150, 0.1);
    }
  }, [datasetName]);

  const sortedDataset = useMemo(() => {
    const indices = Array.from({ length: dataset.X.length }, (_, i) => i);
    indices.sort((a, b) => dataset.y[a] - dataset.y[b]);
    return { X: indices.map(i => dataset.X[i]), y: indices.map(i => dataset.y[i]) };
  }, [dataset]);

  // --- Kernel computation (matrix + optional spectral/geometry analysis) ---
  const { matrix: kernelMatrix, metrics, analysis } = useMemo(
    () => kernelEngine.computeBatchMatrix(sortedDataset, kernelName, showAnalysis),
    [sortedDataset, kernelName, showAnalysis]
  );

  // --- Selection analysis via pipeline (runs only when a point is selected) ---
  const selectionAnalysis = useMemo<AnalysisSelection | null>(() => {
    if (selection === null) return null;
    const output = runAnalysisPipeline({
      matrix: kernelMatrix,
      selectedIndex: selection.datasetIndex,
    });
    return output.selectionAnalysis ?? null;
  }, [selection, kernelMatrix]);

  // --- Interaction handlers ---
  const handleDatasetChange = useCallback((name: string) => {
    setDatasetName(name);
    setSelection(null);
  }, []);

  const handlePointHover = useCallback((index: number, source: Selection['sourceView']) => {
    if (interactionMode !== 'hover') return;
    setSelection({ datasetIndex: index, sourceView: source });
  }, [interactionMode]);

  const handlePointClick = useCallback((index: number, source: Selection['sourceView']) => {
    setSelection(prev =>
      prev?.datasetIndex === index ? null : { datasetIndex: index, sourceView: source }
    );
  }, []);

  const handleNeighborClick = useCallback((index: number) => {
    setSelection({ datasetIndex: index, sourceView: 'dataset' });
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>Quierka Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Kernel Visualization and Analysis Environment</p>

      {/* ── Controls row ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <Controls
            selectedDataset={datasetName}
            selectedKernel={kernelName}
            onDatasetChange={handleDatasetChange}
            onKernelChange={setKernelName}
          />
        </div>

        <div style={{ padding: '12px 16px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={showAnalysis} onChange={e => setShowAnalysis(e.target.checked)} />
            <strong>Enable Kernel Analysis Layer</strong>
          </label>

          <div style={{ display: 'flex', gap: '12px', fontSize: '0.9rem' }}>
            <strong>Interaction:</strong>
            {(['hover', 'click'] as const).map(mode => (
              <label key={mode} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="radio" name="interactionMode" value={mode} checked={interactionMode === mode} onChange={() => setInteractionMode(mode)} />
                {mode === 'hover' ? 'Hover' : 'Click Lock'}
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', fontSize: '0.9rem' }}>
            <strong>Color By:</strong>
            {(['class', 'similarity'] as const).map(mode => (
              <label key={mode} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="radio" name="colorBy" value={mode} checked={colorBy === mode} onChange={() => setColorBy(mode)} />
                {mode === 'class' ? 'Class' : 'Similarity'}
              </label>
            ))}
          </div>

          {colorBy === 'similarity' && selection && (
            <div style={{ fontSize: '0.9rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>Similarity Radius:</strong>
                <input type="range" min={0} max={1} step={0.01} value={similarityThreshold}
                  onChange={e => setSimilarityThreshold(Number(e.target.value))} style={{ width: '120px' }} />
                <span>{similarityThreshold.toFixed(2)}</span>
              </label>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#777' }}>Points below threshold will fade out.</p>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div style={{ padding: '12px 16px', background: '#eef6fc', borderRadius: '8px', fontSize: '0.85rem' }}>
          <strong>Computation Metrics</strong>
          <ul style={{ margin: '5px 0 0', paddingLeft: '18px' }}>
            <li>Time: {metrics.timeMs.toFixed(2)} ms</li>
            <li>Size: {metrics.datasetSize} points</li>
            <li>Memory: {(metrics.memoryEstimateBytes / 1024).toFixed(2)} KB</li>
          </ul>
          {selection && (
            <div style={{ marginTop: '8px' }}>
              <strong>Selected:</strong> #{selection.datasetIndex}
              <span style={{ color: '#888', marginLeft: '8px' }}>via {selection.sourceView}</span>
              <button onClick={() => setSelection(null)}
                style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 6px', cursor: 'pointer' }}>
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Visualizations row ───────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        <ScatterPlot
          dataset={sortedDataset}
          selection={selection}
          analysisSelection={selectionAnalysis}
          colorBy={colorBy}
          similarityThreshold={similarityThreshold}
          onPointHover={(i) => handlePointHover(i, 'dataset')}
          onPointClick={(i) => handlePointClick(i, 'dataset')}
        />

        <GeometryView
          originalDatasetX={sortedDataset.X}
          datasetY={sortedDataset.y}
          analysis={analysis}
          selection={selection}
          analysisSelection={selectionAnalysis}
          colorBy={colorBy}
          similarityThreshold={similarityThreshold}
          onPointHover={(i) => handlePointHover(i, 'geometry')}
          onPointClick={(i) => handlePointClick(i, 'geometry')}
        />

        <div>
          <h2 style={{ fontSize: '1.2rem', textAlign: 'center' }}>Kernel Matrix Heatmap</h2>
          <Heatmap kernelMatrix={kernelMatrix} selectedPointIndex={selection?.datasetIndex} />
        </div>

        {showAnalysis && analysis && (
          <SpectrumView spectrum={analysis.spectrum} />
        )}

        {showAnalysis && analysis?.sensitivity && (
          <SensitivityView sensitivity={analysis.sensitivity} />
        )}

        {showAnalysis && analysis && (
          <DecisionBoundaryView
            datasetX={sortedDataset.X}
            datasetY={sortedDataset.y}
            analysis={analysis}
            selection={selection}
            onPointHover={(i) => handlePointHover(i, 'dataset')}
            onPointClick={(i) => handlePointClick(i, 'dataset')}
          />
        )}
      </div>

      {/* ── Similarity Panel ─────────────────────────────────────── */}
      {selectionAnalysis && (
        <SimilarityPanel 
          analysisSelection={selectionAnalysis} 
          analysis={analysis}
          onNeighborClick={handleNeighborClick} 
        />
      )}
    </div>
  );
}
