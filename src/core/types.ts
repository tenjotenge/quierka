export interface Dataset {
  X: number[][]; // [N, 2] array
  y: number[];   // [N] array of 0 or 1
}

export type KernelFunction = (x: number[], y: number[]) => number;

export interface KernelDefinition {
  name: string;
  func: KernelFunction;
  description: string;
}
