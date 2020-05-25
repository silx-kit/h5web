import { useContext, useMemo } from 'react';
import { Vector3 } from 'three';
import { useThree } from 'react-three-fiber';
import { LineProps, LineContext } from './LineProvider';
import { Domain } from '../shared/models';
import { findDomain, getAxisScale } from '../shared/utils';
import { AxisSystemContext } from '../shared/AxisSystemProvider';

export function useProps(): LineProps {
  const props = useContext(LineContext);

  if (!props) {
    throw new Error('Missing Line provider.');
  }

  return props;
}

export function useDataDomain(): Domain | undefined {
  const { data } = useProps();
  return useMemo(() => findDomain(data), [data]);
}

export function useDataPoints(): Vector3[] | undefined {
  const { data } = useProps();

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
