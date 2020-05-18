import { useContext, useMemo } from 'react';
import { Vector3 } from 'three';
import { LineProps, LineContext } from './LineProvider';
import { Domain } from '../shared/models';
import {
  findDomain,
  useAbscissaScale,
  useOrdinateScale,
} from '../shared/utils';

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
  const { scale: abscissaScale } = useAbscissaScale();
  const { scale: ordinateScale } = useOrdinateScale();

  return useMemo(() => {
    return data.map(
      (val, index) => new Vector3(abscissaScale(index), ordinateScale(val), 0)
    );
  }, [abscissaScale, ordinateScale, data]);
}
