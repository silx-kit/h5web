import { scaleLinear } from 'd3-scale';

export const adaptedNumTicks = scaleLinear()
  .domain([300, 900])
  .rangeRound([3, 10])
  .clamp(true);

export function computeSizeFromAspectRatio(
  availableWidth: number,
  availableHeight: number,
  aspectRatio: number
): { width: number; height: number } {
  // Determine how to compute canvas size to fit available space while maintaining aspect ratio
  const shouldAdjustWidth = availableWidth >= availableHeight * aspectRatio;

  return shouldAdjustWidth
    ? { width: availableHeight * aspectRatio, height: availableHeight }
    : { width: availableWidth, height: availableWidth * aspectRatio };
}
