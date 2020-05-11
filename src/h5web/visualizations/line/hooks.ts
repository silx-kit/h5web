import { useContext, useMemo } from 'react';
import { Vector3 } from 'three';
import { useThree } from 'react-three-fiber';
import { LineProps, LineContext } from './LineProvider';
import { AxisDomains } from '../shared/models';
import { extendDomain, findDomain, sceneToAxisScales } from '../shared/utils';

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
        bottom: extendDomain([0, data.length - 1], 0.01),
        left: extendDomain(dataDomain, 0.01),
      }
    : undefined;
}

export function useDataPoints(): Vector3[] | undefined {
  const { data } = useProps();
  const axisDomains = useAxisDomains();
  const { size } = useThree();

  return useMemo(() => {
    if (axisDomains === undefined) {
      return undefined;
    }

    // sceneToAxis is used to compute scene coordinates from data values (axis) through invert
    const sceneToAxis = sceneToAxisScales(size, axisDomains);

    return data.map(
      (val, index) =>
        new Vector3(sceneToAxis.x.invert(index), sceneToAxis.y.invert(val), 0)
    );
  }, [axisDomains, data, size]);
}
