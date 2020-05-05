import { scaleLinear } from 'd3-scale';
import { AxisOffsets, Size } from './models';

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

  if (!aspectRatio) {
    return { width, height };
  }

  const availableWidth = width - axisOffsets.left;
  const availableHeight = height - axisOffsets.bottom;

  // Determine how to compute canvas size to fit available space while maintaining aspect ratio
  const shouldAdjustWidth = availableWidth >= availableHeight * aspectRatio;

  return shouldAdjustWidth
    ? { width: availableHeight * aspectRatio, height: availableHeight }
    : { width: availableWidth, height: availableWidth * aspectRatio };
}
