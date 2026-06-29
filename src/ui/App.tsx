'use client';
import React, { useState, useMemo } from 'react';
import { Controls } from './components/Controls';
import { ScatterPlot } from './components/ScatterPlot';
import { Heatmap } from './components/Heatmap';

import { Dataset } from '../core/types';
import { makeMoons, makeCircles, makeBlobs, makeSpiral } from '../core/datasets';
import { linearKernel, getPolynomialKernel, getRBFKernel, quantumZZKernel, computeKernelMatrix } from '../core/kernels';

export default function App() {
  const [datasetName, setDatasetName] = useState('moons');
  const [kernelName, setKernelName] = useState('rbf');

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

  // Select kernel function
  const kernelFunc = useMemo(() => {
    switch (kernelName) {
      case 'linear': return linearKernel;
      case 'polynomial': return getPolynomialKernel(3, 1, 1);
      case 'quantum': return quantumZZKernel;
      case 'rbf':
      default:
        return getRBFKernel(1.0);
    }
  }, [kernelName]);

  // Compute kernel matrix
  const kernelMatrix = useMemo(() => {
    return computeKernelMatrix(sortedDataset.X, kernelFunc);
  }, [sortedDataset, kernelFunc]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>Quierka Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Kernel Visualization and Analysis Environment
      </p>

      <Controls 
        selectedDataset={datasetName}
        selectedKernel={kernelName}
        onDatasetChange={setDatasetName}
        onKernelChange={setKernelName}
      />

      <div style={{ display: 'flex', gap: '40px', marginTop: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', textAlign: 'center' }}>Dataset View</h2>
          <ScatterPlot dataset={sortedDataset} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', textAlign: 'center' }}>Kernel Matrix</h2>
          <Heatmap kernelMatrix={kernelMatrix} />
        </div>
      </div>
    </div>
  );
}
