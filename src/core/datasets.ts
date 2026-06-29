import { Dataset } from './types';

// Helper to generate a random number following a normal distribution
function randomNormal(mean = 0, stdDev = 1): number {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

export function makeMoons(n_samples = 100, noise = 0.1): Dataset {
  const X: number[][] = [];
  const y: number[] = [];
  const n_out = Math.floor(n_samples / 2);
  const n_in = n_samples - n_out;

  for (let i = 0; i < n_out; i++) {
    const angle = (i / (n_out - 1)) * Math.PI;
    X.push([
      Math.cos(angle) + randomNormal(0, noise),
      Math.sin(angle) + randomNormal(0, noise)
    ]);
    y.push(0);
  }

  for (let i = 0; i < n_in; i++) {
    const angle = (i / (n_in - 1)) * Math.PI;
    X.push([
      1 - Math.cos(angle) + randomNormal(0, noise),
      1 - Math.sin(angle) - 0.5 + randomNormal(0, noise)
    ]);
    y.push(1);
  }

  return { X, y };
}

export function makeCircles(n_samples = 100, noise = 0.1, factor = 0.5): Dataset {
  const X: number[][] = [];
  const y: number[] = [];
  const n_out = Math.floor(n_samples / 2);
  const n_in = n_samples - n_out;

  for (let i = 0; i < n_out; i++) {
    const angle = (2 * Math.PI * i) / n_out;
    X.push([
      Math.cos(angle) + randomNormal(0, noise),
      Math.sin(angle) + randomNormal(0, noise)
    ]);
    y.push(0);
  }

  for (let i = 0; i < n_in; i++) {
    const angle = (2 * Math.PI * i) / n_in;
    X.push([
      factor * Math.cos(angle) + randomNormal(0, noise),
      factor * Math.sin(angle) + randomNormal(0, noise)
    ]);
    y.push(1);
  }

  return { X, y };
}

export function makeBlobs(n_samples = 100, centers = 2, cluster_std = 0.5): Dataset {
  const X: number[][] = [];
  const y: number[] = [];
  
  // Define static centers
  const centerPoints = [[-1, -1], [1, 1], [-1, 1], [1, -1]];
  
  for (let i = 0; i < n_samples; i++) {
    const classIdx = i % centers;
    const center = centerPoints[classIdx % centerPoints.length];
    
    X.push([
      center[0] + randomNormal(0, cluster_std),
      center[1] + randomNormal(0, cluster_std)
    ]);
    y.push(classIdx);
  }

  return { X, y };
}

export function makeSpiral(n_samples = 100, noise = 0.1): Dataset {
  const X: number[][] = [];
  const y: number[] = [];
  const classes = 2;
  const n = Math.floor(n_samples / classes);
  
  for (let classIdx = 0; classIdx < classes; classIdx++) {
    for (let i = 0; i < n; i++) {
      const radius = (i / n) * 2;
      const angle = (i / n) * 4 * Math.PI + classIdx * Math.PI;
      
      X.push([
        radius * Math.cos(angle) + randomNormal(0, noise),
        radius * Math.sin(angle) + randomNormal(0, noise)
      ]);
      y.push(classIdx);
    }
  }

  return { X, y };
}
