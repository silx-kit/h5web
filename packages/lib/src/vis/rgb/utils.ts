import type { NumArray } from '@h5web/shared';
import { createArrayFromView, toTypedNdArray } from '@h5web/shared';
import type { NdArray, TypedArray } from 'ndarray';
import ndarray from 'ndarray';

/*
 * - `Float32Array | Float64Array` ndarrays must contain normalized color values in the range [0, 1].
 * - `Int8Array` ndarrays must contain color values in the range [-128, 127].
 * - `number[]` and all other typed ndarrays must contain color values in the range [0, 255].
 */
export function toRgbSafeNdArray(
  ndArr: NdArray<NumArray>
): NdArray<Uint8Array | Uint8ClampedArray | Float32Array> {
  if (
    ndArr.dtype === 'uint8' ||
    ndArr.dtype === 'uint8_clamped' ||
    ndArr.dtype === 'float32'
  ) {
    return ndArr as NdArray<Uint8Array | Uint8ClampedArray | Float32Array>;
  }

  if (ndArr.dtype === 'float64') {
    return toTypedNdArray(ndArr, Float32Array);
  }

  if (ndArr.dtype === 'int8') {
    return ndarray(
      Uint8Array.from([...ndArr.data].map((val) => val + 128)),
      ndArr.shape
    );
  }

  return toTypedNdArray(ndArr, Uint8Array);
}

export function flipLastDimension<T extends TypedArray>(
  dataArray: NdArray<T>
): NdArray<T> {
  const { shape } = dataArray;
  const steps = shape.map((_, index) => (index === shape.length - 1 ? -1 : 1));

  const flippedView = dataArray.step(...steps);
  return createArrayFromView(flippedView);
}
