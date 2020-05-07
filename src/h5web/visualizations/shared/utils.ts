import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { Camera } from 'react-three-fiber';
import { Size, Domain, TwoDimScale } from './models';

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

export function computeAxisScales(
  camera: Camera,
  size: Size,
  cameraToBounds: TwoDimScale
): TwoDimScale {
  const { position, zoom } = camera;
  const { width, height } = size;

  const xBounds = [
    cameraToBounds.x(-width / (2 * zoom) + position.x),
    cameraToBounds.x(width / (2 * zoom) + position.x),
  ];
  const yBounds = [
    cameraToBounds.y(-height / (2 * zoom) + position.y),
    cameraToBounds.y(height / (2 * zoom) + position.y),
  ];

  return {
    x: scaleLinear()
      .domain(xBounds)
      .range([0, width]),
    y: scaleLinear()
      .domain(yBounds)
      .range([height, 0]),
  };
}
