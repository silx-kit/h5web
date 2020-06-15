/// <reference types="react-scripts" />

declare module 'ndarray-unpack' {
  import type ndarray from 'ndarray';

  function unpack<LT = T>(a: ndarray<T>): LT[];

  export = unpack;
}

declare module 'ndarray-pack' {
  function pack<LT = T>(a: T[]): ndarray<LT>;

  export = pack;
}
