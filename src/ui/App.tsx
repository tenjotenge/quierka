'use client';
import React, { useState, useMemo } from 'react';
import { Controls } from './components/Controls';
import { ScatterPlot } from './components/ScatterPlot';
import { Heatmap } from './components/Heatmap';
import { SpectrumView } from './components/SpectrumView';
import { GeometryView } from './components/GeometryView';

import { makeMoons, makeCircles, makeBlobs, makeSpiral } from '../core/datasets';
import { kernelEngine } from '../core/engine/kernelEngine';

export default function App() {
  const [datasetName, setDatasetName] = useState('moons');
  const [kernelName, setKernelName] = useState('rbf');
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Generate dataset based on selection
  const dataset = useMemo(() => {
    switch (datasetName) {
      case 'circles': return makeCircles(150, 0.1, 0.5);
      case 'blobs': return makeBlobs(150, 2, 0.6);
      case 'spiral': return makeSpiral(150, 0.1);
      case 'moons':
      default:
        return makeMoons(150, 0.1);
    }
  }, [datasetName]);

  // Sort dataset by label to make the kernel matrix block-diagonal-like
  const sortedDataset = useMemo(() => {
    const indices = Array.from({ length: dataset.X.length }, (_, i) => i);
    indices.sort((a, b) => dataset.y[a] - dataset.y[b]);
    
    return {
      X: indices.map(i => dataset.X[i]),
      y: indices.map(i => dataset.y[i])
    };
  }, [dataset]);

  // Compute kernel matrix via the Engine (now with optional analysis)
  const computationResult = useMemo(() => {
    return kernelEngine.computeBatchMatrix(sortedDataset, kernelName, showAnalysis);
  }, [sortedDataset, kernelName, showAnalysis]);

  const { matrix: kernelMatrix, metrics, analysis } = computationResult;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>Quierka Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Kernel Visualization and Analysis Environment
      </p>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <Controls 
            selectedDataset={datasetName}
            selectedKernel={kernelName}
            onDatasetChange={setDatasetName}
            onKernelChange={setKernelName}
          />
        </div>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', height: '100%', display: 'flex', alignItems: 'center' }}>
          <label style={{ fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              checked={showAnalysis} 
              onChange={(e) => setShowAnalysis(e.target.checked)} 
              style={{ transform: 'scale(1.5)' }}
            />
            <strong>Enable Kernel Analysis Layer</strong>
          </label>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#eef6fc', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <strong>Computation Metrics:</strong>
          <ul style={{ margin: '5px 0 0', paddingLeft: '20px' }}>
            <li>Time: {metrics.timeMs.toFixed(2)} ms</li>
            <li>Dataset Size: {metrics.datasetSize} points</li>
            <li>Memory Estimate: {(metrics.memoryEstimateBytes / 1024).toFixed(2)} KB</li>
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px', marginTop: '40px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        <GeometryView originalDatasetX={sortedDataset.X} datasetY={sortedDataset.y} analysis={analysis} />
        
        <div>
          <h2 style={{ fontSize: '1.2rem', textAlign: 'center' }}>Kernel Matrix Heatmap</h2>
          <Heatmap kernelMatrix={kernelMatrix} />
        </div>
        
        {showAnalysis && analysis && (
          <SpectrumView spectrum={analysis.spectrum} />
        )}
      </div>
    </div>
  );
}
