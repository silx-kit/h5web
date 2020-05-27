import { useVisProps } from '../../dataset-visualizer/VisProvider';

type Dims = [number] | [number, number];

export function useData(): number[][] {
  const { values, rawDims } = useVisProps();

  if (rawDims.length === 1 || rawDims.length === 2) {
    return values;
  }

  throw new Error('Data not supported by MatrixVis');
}

export function useDims(): Dims {
  const { rawDims } = useVisProps();

  if (rawDims.length === 1 || rawDims.length === 2) {
    return rawDims as Dims;
  }

  throw new Error('Data not supported by MatrixVis');
}
