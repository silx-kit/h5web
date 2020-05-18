import { scaleLinear, scaleSymlog } from 'd3-scale';
import { extent } from 'd3-array';
import { useThree } from 'react-three-fiber';
import { useContext } from 'react';
import { Theme } from 'react-select';
import {
  Size,
  Domain,
  DataScaleFn,
  AxisConfig,
  IndexAxisConfig,
  AxisScale,
} from './models';
import { AxisSystemContext } from './AxisSystemProvider';

export const adaptedNumTicks = scaleLinear()
  .domain([300, 900])
  .rangeRound([3, 10])
  .clamp(true);

export function computeVisSize(
  availableSize: Size,
  aspectRatio?: number
): Size | undefined {
  const { width, height } = availableSize;

  if (width <= 0 && height <= 0) {
    return undefined;
  }

  if (!aspectRatio) {
    return availableSize;
  }

  // Determine how to compute canvas size to fit available space while maintaining aspect ratio
  const idealHeight = width / aspectRatio;
  const shouldReduceWidth = idealHeight > height;

  return shouldReduceWidth
    ? { width: height * aspectRatio, height }
    : { width, height: width / aspectRatio };
}

export function extendDomain(bareDomain: Domain, extendFactor: number): Domain {
  const [min, max] = bareDomain;
  const extension = (max - min) * extendFactor;

  return [min - extension, max + extension];
}

export function findDomain(data: number[]): Domain | undefined {
  const domain = extent(data);
  return domain[0] !== undefined && domain[1] !== undefined
    ? domain
    : undefined;
}

export function isIndexAxisConfig(
  config: AxisConfig
): config is IndexAxisConfig {
  return 'indexDomain' in config;
}

export function getDataScaleFn(isLog: boolean): DataScaleFn {
  return isLog ? scaleSymlog : scaleLinear;
}

function useAxisScale(config: AxisConfig, rangeSize: number): AxisScale {
  if (isIndexAxisConfig(config)) {
    const { indexDomain } = config;
    const scaleFn = scaleLinear;

    const scale = scaleFn();
    scale.domain(indexDomain);
    scale.range([-rangeSize / 2, rangeSize / 2]);

    return { scale, scaleFn, domain: indexDomain };
  }

  const { dataDomain, isLog = false } = config;
  const scaleFn = getDataScaleFn(isLog);

  const scale = scaleFn();
  scale.domain(dataDomain);
  scale.range([-rangeSize / 2, rangeSize / 2]);

  return { scale, scaleFn, domain: dataDomain };
}

export function useAbscissaScale(): AxisScale {
  const { size } = useThree();
  const { abscissaConfig } = useContext(AxisSystemContext);
  return useAxisScale(abscissaConfig, size.width);
}

export function useOrdinateScale(): AxisScale {
  const { size } = useThree();
  const { ordinateConfig } = useContext(AxisSystemContext);
  return useAxisScale(ordinateConfig, size.height);
}

export function customThemeForSelect(theme: Theme): Theme {
  return {
    ...theme,
    borderRadius: 0,
    colors: {
      ...theme.colors,
      primary: 'var(--secondary-dark)',
      primary75: 'var(--secondary)',
      primary50: 'var(--secondary-light)',
      primary25: 'var(--secondary-light-bg)',
    },
  };
}
