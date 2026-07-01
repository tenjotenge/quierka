import React from 'react';
import Plot from 'react-plotly.js';
import { SensitivityMetrics } from '../../core/types';

interface SensitivityViewProps {
  sensitivity: SensitivityMetrics;
}

function generateInterpretation(stabilityScore: number): string {
  if (stabilityScore >= 0.85) {
    return 'Highly stable kernel. Relationships are robust to small perturbations of the input.';
  } else if (stabilityScore >= 0.6) {
    return 'Moderately sensitive kernel. Some relationships shift under perturbation; check high-sensitivity points.';
  } else {
    return 'Highly unstable kernel. Kernel values change substantially under small input noise — fragile structure.';
  }
}

function stabilityColor(score: number): string {
  if (score >= 0.85) return '#2e7d32';   // green
  if (score >= 0.6)  return '#f57c00';   // amber
  return '#c62828';                       // red
}

export const SensitivityView: React.FC<SensitivityViewProps> = ({ sensitivity }) => {
  const { stabilityScore, meanChange, variance, perPointSensitivity } = sensitivity;
  const color = stabilityColor(stabilityScore);
  const interpretation = generateInterpretation(stabilityScore);
  const n = perPointSensitivity.length;

  return (
    <div style={{ minWidth: '340px' }}>
      <h2 style={{ fontSize: '1.2rem', margin: '0 0 10px 0' }}>Sensitivity Analysis</h2>

      {/* Stability gauge row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '12px 16px', borderRadius: '8px',
        background: '#fafafa', border: `2px solid ${color}`, marginBottom: '10px'
      }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
          {(stabilityScore * 100).toFixed(1)}%
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stability Score</div>
          <div style={{ fontSize: '0.85rem', color, fontWeight: 600 }}>{interpretation.split('.')[0]}</div>
        </div>
      </div>

      {/* Compact stats */}
      <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', marginBottom: '8px', color: '#555' }}>
        <span><strong>Mean Δ:</strong> {meanChange.toFixed(4)}</span>
        <span><strong>Variance:</strong> {variance.toFixed(4)}</span>
      </div>

      {/* Per-point sensitivity bar chart */}
      <Plot
        data={[{
          y: perPointSensitivity,
          type: 'bar',
          marker: {
            color: perPointSensitivity,
            colorscale: [
              [0, '#2e7d32'],
              [0.5, '#f57c00'],
              [1, '#c62828']
            ],
            showscale: false
          },
          hovertemplate: 'Point %{x}<br>Sensitivity: %{y:.4f}<extra></extra>'
        }]}
        layout={{
          width: 340,
          height: 220,
          margin: { l: 40, r: 10, t: 10, b: 30 },
          xaxis: { title: 'Point Index', showticklabels: n <= 50 },
          yaxis: { title: 'Sensitivity' },
          showlegend: false
        }}
        config={{ displayModeBar: false }}
      />

      <p style={{ fontSize: '0.82rem', color: '#666', margin: '6px 0 0', fontStyle: 'italic' }}>
        {interpretation}
      </p>
    </div>
  );
};
