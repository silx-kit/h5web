/// <reference types="react-scripts" />

declare module 'ndarray-ops' {
  import type { NdArray } from 'ndarray';

  export function assign(a: NdArray<T>, b: NdArray<T>);
}
