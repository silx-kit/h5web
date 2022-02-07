import { createArrayFromView } from '@h5web/shared';
import type { NdArray, TypedArray } from 'ndarray';

export function flipLastDimension<T extends TypedArray>(
  dataArray: NdArray<T>
): NdArray<T> {
  const { shape } = dataArray;
  const steps = shape.map((_, index) => (index === shape.length - 1 ? -1 : 1));

  const flippedView = dataArray.step(...steps);
  return createArrayFromView(flippedView);
}
