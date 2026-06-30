'use client';
import React, { useState, useMemo } from 'react';
import { Controls } from './components/Controls';
import { ScatterPlot } from './components/ScatterPlot';
import { Heatmap } from './components/Heatmap';
import { SpectrumView } from './components/SpectrumView';

import { makeMoons, makeCircles, makeBlobs, makeSpiral } from '../core/datasets';
import { kernelEngine } from '../core/engine/kernelEngine';

export default function App() {
  const [datasetName, setDatasetName] = useState('moons');
  const [kernelName, setKernelName] = useState('rbf');
  const [showSpectrum, setShowSpectrum] = useState(false);

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

  // Compute kernel matrix via the Engine (now with optional spectrum)
  const computationResult = useMemo(() => {
    return kernelEngine.computeBatchMatrix(sortedDataset, kernelName, showSpectrum);
  }, [sortedDataset, kernelName, showSpectrum]);

  const { matrix: kernelMatrix, metrics, spectrum, stats } = computationResult;

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
              checked={showSpectrum} 
              onChange={(e) => setShowSpectrum(e.target.checked)} 
              style={{ transform: 'scale(1.5)' }}
            />
            <strong>Show Spectrum View</strong>
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
        {stats && (
          <div>
            <strong>Spectral Stats:</strong>
            <ul style={{ margin: '5px 0 0', paddingLeft: '20px' }}>
              <li>Effective Rank: {stats.effectiveRank.toFixed(2)}</li>
              <li>Entropy: {stats.entropy.toFixed(3)} nats</li>
            </ul>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '40px', marginTop: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', textAlign: 'center' }}>Dataset View</h2>
          <ScatterPlot dataset={sortedDataset} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', textAlign: 'center' }}>Kernel Matrix</h2>
          <Heatmap kernelMatrix={kernelMatrix} />
        </div>
        {showSpectrum && spectrum && (
          <SpectrumView spectrum={spectrum} />
        )}
      </div>
    </div>
  );
}
