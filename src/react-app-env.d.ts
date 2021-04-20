/// <reference types="react-scripts" />

declare module 'ndarray-unpack' {
  import ndarray from 'ndarray';

  function unpack<LT = T>(a: ndarray<T>): LT[];
  export = unpack;
}

declare module 'ndarray-ops' {
  export function assign(a: ndarray<T>, b: ndarray<T>);
}
