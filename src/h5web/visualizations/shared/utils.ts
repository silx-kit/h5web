import { scaleLinear, scaleSymlog } from 'd3-scale';
import { extent } from 'd3-array';
import { useThree } from 'react-three-fiber';
import { useContext } from 'react';
import { Size, Domain, DataScale, DataScaleFn } from './models';
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
  const shouldAdjustWidth = width >= height * aspectRatio;

  return shouldAdjustWidth
    ? { width: height * aspectRatio, height }
    : { width, height: width * aspectRatio };
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

export function getDataScaleFn(isLog: boolean): DataScaleFn {
  return isLog ? scaleSymlog : scaleLinear;
}

export function useAbscissaScale(): {
  abscissaScale: DataScale;
  abscissaScaleFn: DataScaleFn;
} {
  const { size } = useThree();
  const { width } = size;
  const { axisDomains, hasXLogScale: log } = useContext(AxisSystemContext);

  const abscissaScaleFn = getDataScaleFn(!!log);
  const abscissaScale = abscissaScaleFn();
  abscissaScale.domain(axisDomains.x);
  abscissaScale.range([-width / 2, width / 2]);

  return { abscissaScale, abscissaScaleFn };
}

export function useOrdinateScale(): {
  ordinateScale: DataScale;
  ordinateScaleFn: DataScaleFn;
} {
  const { size } = useThree();
  const { height } = size;
  const { axisDomains, hasYLogScale: log } = useContext(AxisSystemContext);

  const ordinateScaleFn = getDataScaleFn(!!log);
  const ordinateScale = ordinateScaleFn();
  ordinateScale.domain(axisDomains.y);
  ordinateScale.range([-height / 2, height / 2]);

  return { ordinateScale, ordinateScaleFn };
}
