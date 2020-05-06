import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { AxisOffsets, Size, Domain } from './models';

export const adaptedNumTicks = scaleLinear()
  .domain([300, 900])
  .rangeRound([3, 10])
  .clamp(true);

export function computeVisSize(
  visAreaSize: Size,
  axisOffsets: AxisOffsets,
  aspectRatio?: number
): Size | undefined {
  const { width, height } = visAreaSize;

  if (width === 0 && height === 0) {
    return undefined;
  }

  const availableWidth = width - axisOffsets.left;
  const availableHeight = height - axisOffsets.bottom;

  if (!aspectRatio) {
    return { width: availableWidth, height: availableHeight };
  }

  // Determine how to compute canvas size to fit available space while maintaining aspect ratio
  const shouldAdjustWidth = availableWidth >= availableHeight * aspectRatio;

  return shouldAdjustWidth
    ? { width: availableHeight * aspectRatio, height: availableHeight }
    : { width: availableWidth, height: availableWidth * aspectRatio };
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
