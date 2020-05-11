import { useContext, useMemo } from 'react';
import { Vector3 } from 'three';
import { LineProps, LineContext } from './LineProvider';
import { AxisDomains } from '../shared/models';
import {
  extendDomain,
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

export function useAxisDomains(): AxisDomains | undefined {
  const { data } = useProps();
  const dataDomain = useMemo(() => findDomain(data), [data]);

  return dataDomain
    ? {
        x: extendDomain([0, data.length - 1], 0.01),
        y: extendDomain(dataDomain, 0.01),
      }
    : undefined;
}

export function useDataPoints(): Vector3[] | undefined {
  const { data } = useProps();
  const { abscissaScale } = useAbscissaScale();
  const { ordinateScale } = useOrdinateScale();

  return useMemo(() => {
    return data.map(
      (val, index) => new Vector3(abscissaScale(index), ordinateScale(val), 0)
    );
  }, [abscissaScale, ordinateScale, data]);
}
