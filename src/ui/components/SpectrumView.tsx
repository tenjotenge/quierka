import React, { useState } from 'react';
import Plot from 'react-plotly.js';

interface SpectrumViewProps {
  spectrum: number[];
}

export const SpectrumView: React.FC<SpectrumViewProps> = ({ spectrum }) => {
  const [logScale, setLogScale] = useState(true);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Spectrum Decay</h2>
        <label style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={logScale} 
            onChange={(e) => setLogScale(e.target.checked)} 
            style={{ marginRight: '5px' }}
          />
          Log Scale
        </label>
      </div>
      <Plot
        data={[
          {
            y: spectrum,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'green', size: 6 },
            line: { color: 'lightgreen' }
          }
        ]}
        layout={{ 
          width: 400, 
          height: 400,
          margin: { l: 50, r: 40, t: 40, b: 40 },
          yaxis: { type: logScale ? 'log' : 'linear', title: 'Eigenvalue' },
          xaxis: { title: 'Index' },
          showlegend: false
        }}
        config={{ displayModeBar: false }}
      />
    </div>
  );
};
