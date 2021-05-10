/// <reference types="react-scripts" />

declare module 'ndarray-unpack' {
  import type { NdArray } from 'ndarray';

  function unpack<LT = T>(a: NdArray<T>): LT[];
  export = unpack;
}

declare module 'ndarray-ops' {
  export function assign(a: NdArray<T>, b: NdArray<T>);
}
