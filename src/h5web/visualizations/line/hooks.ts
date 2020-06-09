import { useMemo, useContext } from 'react';
import { Vector3 } from 'three';
import { useThree } from 'react-three-fiber';
import type { Domain } from '../shared/models';
import { findDomain, getAxisScale } from '../shared/utils';
import { AxisSystemContext } from '../shared/AxisSystemProvider';
import { useDataArray } from '../../dataset-visualizer/VisProvider';

export function useDataDomain(): Domain | undefined {
  const dataArray = useDataArray();
  return useMemo(() => findDomain(dataArray.data as number[]), [dataArray]);
}

export function useDataPoints(): Vector3[] | undefined {
  const dataArray = useDataArray();

  const { abscissaInfo, ordinateInfo } = useContext(AxisSystemContext);
  const { size } = useThree();
  const { width, height } = size;

  const abscissaScale = getAxisScale(abscissaInfo, width);
  const ordinateScale = getAxisScale(ordinateInfo, height);

  return useMemo(() => {
    return (dataArray.data as number[]).map(
      (val, index) => new Vector3(abscissaScale(index), ordinateScale(val), 0)
    );
  }, [abscissaScale, ordinateScale, dataArray]);
}
