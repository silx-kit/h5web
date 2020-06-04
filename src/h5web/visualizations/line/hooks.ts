import { useMemo, useContext } from 'react';
import { Vector3 } from 'three';
import { useThree } from 'react-three-fiber';
import type { Domain } from '../shared/models';
import { findDomain, getAxisScale } from '../shared/utils';
import { AxisSystemContext } from '../shared/AxisSystemProvider';
import { useVisProps } from '../../dataset-visualizer/VisProvider';

export function useData(): number[] {
  const { values, slicingIndices } = useVisProps();

  if (slicingIndices && slicingIndices.length > 0) {
    return (values as number[][])[slicingIndices[0]];
  }

  return values as number[];
}

export function useDataDomain(): Domain | undefined {
  const data = useData();
  return useMemo(() => findDomain(data), [data]);
}

export function useDataPoints(): Vector3[] | undefined {
  const data = useData();

  const { abscissaInfo, ordinateInfo } = useContext(AxisSystemContext);
  const { size } = useThree();
  const { width, height } = size;

  const abscissaScale = getAxisScale(abscissaInfo, width);
  const ordinateScale = getAxisScale(ordinateInfo, height);

  return useMemo(() => {
    return data.map(
      (val, index) => new Vector3(abscissaScale(index), ordinateScale(val), 0)
    );
  }, [abscissaScale, ordinateScale, data]);
}
