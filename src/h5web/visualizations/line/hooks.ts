import { useContext, useMemo } from 'react';
import { Vector3 } from 'three';
import { scaleLinear } from 'd3-scale';
import { useThree } from 'react-three-fiber';
import { LineVisProps, LineVisContext } from './LineVisProvider';
import { AxisDomains } from '../shared/models';
import { extendDomain, findDomain } from '../shared/utils';

export function useProps(): LineVisProps {
  const props = useContext(LineVisContext);

  if (!props) {
    throw new Error('Missing LineVis provider.');
  }

  return props;
}

export function useAxisDomains(): AxisDomains | undefined {
  const { data } = useProps();
  const dataDomain = useMemo(() => findDomain(data), [data]);

  return dataDomain
    ? {
        bottom: extendDomain([0, data.length - 1], 0.05),
        left: extendDomain(dataDomain, 0.05),
      }
    : undefined;
}

export function useDataPoints(): Vector3[] | undefined {
  const { data } = useProps();
  const axisDomains = useAxisDomains();
  const {
    size: { height, width },
  } = useThree();

  return useMemo(() => {
    if (axisDomains === undefined) {
      return undefined;
    }

    const xScale = scaleLinear()
      .domain(axisDomains.bottom)
      .range([-width / 2, width / 2]);
    const yScale = scaleLinear()
      .domain(axisDomains.left)
      .range([-height / 2, height / 2]);

    return data.map((val, index) => new Vector3(xScale(index), yScale(val), 0));
  }, [axisDomains, data, height, width]);
}
