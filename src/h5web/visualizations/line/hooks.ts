import { useMemo, useContext } from 'react';
import { Vector3 } from 'three';
import { useThree } from 'react-three-fiber';
import { Domain } from '../shared/models';
import { findDomain, getAxisScale } from '../shared/utils';
import { AxisSystemContext } from '../shared/AxisSystemProvider';
import {
  useVisProps,
  useFlatValues,
} from '../../dataset-visualizer/VisProvider';

export function useData(): number[] {
  const { rawValues, rawDims, mapping } = useVisProps();
  const values = useFlatValues();

  if (rawDims.length === 1) {
    return rawValues;
  }

  if (rawDims.length === 2) {
    if (mapping.x === 1) {
      return rawValues[mapping.slicingIndices[0]];
    }

    return values.filter(
      (v, i) => i % rawDims[1] === mapping.slicingIndices[1]
    );
  }

  throw new Error('Data not supported by LineVis');
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
