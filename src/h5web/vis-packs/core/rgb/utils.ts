import ndarray from 'ndarray';
import { createArrayFromView } from '../utils';

export function flipLastDimension(value: number[], dims: number[]) {
  const baseArray = ndarray(value, dims);
  const steps = dims.map((_, index) => (index === dims.length - 1 ? -1 : 1));

  const flippedView = baseArray.step(...steps);
  return createArrayFromView(flippedView).data;
}
