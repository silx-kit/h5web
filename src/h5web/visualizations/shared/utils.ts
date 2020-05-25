import { scaleLinear, scaleSymlog } from 'd3-scale';
import { extent, tickStep } from 'd3-array';
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

function getAxisScale(config: AxisConfig, rangeSize: number): AxisScale {
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
  return getAxisScale(abscissaConfig, size.width);
}

export function useOrdinateScale(): AxisScale {
  const { size } = useThree();
  const { ordinateConfig } = useContext(AxisSystemContext);
  return getAxisScale(ordinateConfig, size.height);
}

/**
 * We can't rely on the axis scale's `ticks` method to get integer tick values because
 * `d3.tickStep` sometimes returns incoherent step values - e.g. `d3.tickStep(0, 2, 3)`
 * returns 0.5 intead of 1.
 *
 * So we implement our own, simplified version of `d3.ticks` that always outputs integer values.
 */
function getIntegerTicks(domain: Domain, count: number): number[] {
  const [min, max] = domain;
  const intMin = Math.ceil(min);
  const intMax = Math.floor(max);

  const domainLength = intMax - intMin + 1;
  const optimalCount = Math.min(domainLength, count);

  if (optimalCount === 0) {
    return [];
  }

  // Make sure we always use a step that is greater than or equal to 1
  const step = Math.max(tickStep(intMin, intMax, optimalCount), 1);

  const start = Math.ceil(min / step);
  const stop = Math.floor(max / step);
  const numTicks = stop - start + 1;

  const ticks = new Array(numTicks);
  for (let i = 0; i < numTicks; i++) {
    ticks[i] = (start + i) * step;
  }

  return ticks;
}

export function getTicksProp(
  config: AxisConfig,
  visibleDomain: Domain,
  availableSize: number
): { tickValues: number[] } | { numTicks: number } {
  const numTicks = adaptedNumTicks(availableSize);

  return isIndexAxisConfig(config)
    ? { tickValues: getIntegerTicks(visibleDomain, numTicks) }
    : { numTicks };
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
