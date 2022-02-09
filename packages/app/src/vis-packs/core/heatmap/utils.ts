import type { TextureTypedArray } from '@h5web/lib';
import type { TypedArray } from 'ndarray';

export function assertTextureNumArray(
  arr: number[] | TypedArray
): asserts arr is number[] | TextureTypedArray {
  if (arr instanceof Uint8ClampedArray || arr instanceof Float64Array) {
    throw new TypeError('Typed array not supported');
  }
}
