import {
  type Domain,
  type NumArray,
  ScaleType,
} from '@h5web/shared/vis-models';
import { rgb } from 'd3-color';
import ndarray, { type NdArray } from 'ndarray';
import { Color, SRGBColorSpace } from 'three';

import { type ColorMap } from '../heatmap/models';
import { getInterpolator } from '../heatmap/utils';
import { createScale, getAxisDomain, getIntegerTicks } from '../utils';

/* Above this number of vertices, the surface is downsampled (by decimation)
 * to keep geometry generation and rendering responsive (~1024 x 1024). */
export const DEFAULT_MAX_VERTICES = 1024 * 1024;

const LUT_SIZE = 256;

/** Surfaces need at least two rows and two columns to have any triangle. */
export function isSurfaceSupported(shape: number[]): boolean {
  return shape.length === 2 && shape[0] >= 2 && shape[1] >= 2;
}

/**
 * Stride to apply along both dimensions so that the
 * number of vertices does not exceed `maxVertices`.
 */
export function getDownsamplingStride(
  rows: number,
  cols: number,
  maxVertices = DEFAULT_MAX_VERTICES,
): number {
  if (rows * cols <= maxVertices) {
    return 1;
  }

  // Initial estimate, then account for dimensions that cannot shrink proportionally
  // (e.g. very elongated arrays) and for last index always being sampled
  let stride = Math.ceil(Math.sqrt((rows * cols) / maxVertices));
  const maxStride = Math.max(rows, cols);

  while (
    stride < maxStride &&
    getSampledCount(rows, stride) * getSampledCount(cols, stride) > maxVertices
  ) {
    stride += 1;
  }

  return stride;
}

function getSampledCount(length: number, stride: number): number {
  return Math.ceil((length - 1) / stride) + 1;
}

/**
 * Indices `0, stride, 2 * stride, ...` along a dimension of given length,
 * always including the last index so the full extent of the data is preserved.
 */
export function getSampledIndices(length: number, stride: number): number[] {
  const indices: number[] = [];
  for (let i = 0; i < length; i += stride) {
    indices.push(i);
  }

  if (length > 0 && indices[indices.length - 1] !== length - 1) {
    indices.push(length - 1);
  }

  return indices;
}

/** Pick the given rows and columns of a 2D array (nearest-neighbour decimation). */
export function sampleArray(
  values: NdArray<NumArray>,
  rowIndices: number[],
  colIndices: number[],
): NdArray<NumArray> {
  const [rows, cols] = values.shape;
  if (rowIndices.length === rows && colIndices.length === cols) {
    return values;
  }

  const data = new Float64Array(rowIndices.length * colIndices.length);
  rowIndices.forEach((row, i) => {
    colIndices.forEach((col, j) => {
      data[i * colIndices.length + j] = values.get(row, col);
    });
  });

  return ndarray(data, [rowIndices.length, colIndices.length]);
}

/**
 * Coordinates of the centres of the data cells along a dimension of size `count`:
 * - indices if no axis values are provided;
 * - mid-points if axis values are pixel edges (i.e. `count + 1` values);
 * - axis values as is otherwise.
 */
export function getCellCenters(
  axisValues: NumArray | undefined,
  count: number,
): number[] {
  if (!axisValues || axisValues.length < count) {
    return Array.from({ length: count }, (_, i) => i);
  }

  if (axisValues.length > count) {
    return Array.from(
      { length: count },
      (_, i) => (axisValues[i] + axisValues[i + 1]) / 2,
    );
  }

  return [...axisValues];
}

/**
 * Domain of an axis, kept descending if the axis values are descending (like in `HeatmapVis`),
 * so that the surface is not mirrored compared to the heatmap.
 */
export function getCoordsDomain(coords: number[]): Domain {
  const domain = getAxisDomain(coords) ?? [-0.5, 0.5];
  const [first, last] = domain;
  if (first !== last) {
    return domain;
  }

  return [first - 0.5, last + 0.5];
}

/**
 * Size of the surface's footprint in world units - the longest side always measures 1.
 * When `keepRatio` is true, the ratio between the axis extents is respected.
 */
export function getFootprint(
  xDomain: Domain,
  yDomain: Domain,
  keepRatio: boolean,
): [number, number] {
  if (!keepRatio) {
    return [1, 1];
  }

  const ratio = Math.abs((xDomain[1] - xDomain[0]) / (yDomain[1] - yDomain[0]));
  return ratio >= 1 ? [1, 1 / ratio] : [ratio, 1];
}

/** Nice ticks within domain (ascending or descending); integer ticks only for axes of indices. */
export function getAxisTicks(
  domain: Domain,
  count: number,
  isIndexAxis: boolean,
): number[] {
  if (isIndexAxis) {
    return getIntegerTicks(domain, count);
  }

  return createScale(ScaleType.Linear, { domain }).ticks(count);
}

/** Colour map lookup table in linear RGB, as expected by three.js vertex colours. */
export function getLinearColorLut(
  colorMap: ColorMap,
  invertColorMap: boolean,
): Float32Array {
  const interpolator = getInterpolator(colorMap, invertColorMap);
  const lut = new Float32Array(LUT_SIZE * 3);
  const color = new Color();

  for (let i = 0; i < LUT_SIZE; i += 1) {
    const { r, g, b } = rgb(interpolator(i / (LUT_SIZE - 1)));
    color.setRGB(r / 255, g / 255, b / 255, SRGBColorSpace); // converts to linear
    lut.set([color.r, color.g, color.b], i * 3);
  }

  return lut;
}

/**
 * Distance from which a perspective camera sees a whole sphere of given radius,
 * whatever the aspect ratio of the viewport.
 */
export function getFramingDistance(
  radius: number,
  fov: number, // vertical, in degrees
  aspect: number,
): number | undefined {
  if (!Number.isFinite(aspect) || aspect <= 0 || radius <= 0) {
    return undefined; // e.g. canvas not laid out yet (zero width or height)
  }

  const vFov = (fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  return radius / Math.sin(Math.min(vFov, hFov) / 2);
}
