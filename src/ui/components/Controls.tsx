import React from 'react';

interface ControlsProps {
  onDatasetChange: (datasetName: string) => void;
  onKernelChange: (kernelName: string) => void;
  selectedDataset: string;
  selectedKernel: string;
}

export const Controls: React.FC<ControlsProps> = ({
  onDatasetChange,
  onKernelChange,
  selectedDataset,
  selectedKernel
}) => {
  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Dataset</label>
        <select 
          value={selectedDataset} 
          onChange={(e) => onDatasetChange(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="moons">Moons</option>
          <option value="circles">Circles</option>
          <option value="blobs">Gaussian Blobs</option>
          <option value="spiral">Spiral</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Kernel</label>
        <select 
          value={selectedKernel} 
          onChange={(e) => onKernelChange(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="linear">Linear Kernel</option>
          <option value="polynomial">Polynomial Kernel</option>
          <option value="rbf">RBF (Gaussian) Kernel</option>
          <option value="quantum">Quantum-Inspired ZZ Kernel</option>
        </select>
      </div>
    </div>
  );
};
