import { type Domain, type NumArray, type ScaleType } from '@h5web/shared';
import { rgb, type RGBColor } from 'd3-color';

import { type ColorMap } from '../heatmap/models';
import { getInterpolator } from '../heatmap/utils';
import { type AxisScale } from '../models';
import { createAxisScale } from '../utils';

const CAMERA_FAR = 1000; // R3F's default

export function getIndexToPosition(
  abscissas: NumArray,
  abscissaScale: AxisScale,
  ordinates: NumArray,
  ordinateScale: AxisScale
): (index: number) => { x: number; y: number; z: number } {
  return (index: number) => {
    const x = abscissaScale(abscissas[index]);
    const y = ordinateScale(ordinates[index]);

    /* Render points with NaN/Infinity coordinates (i.e. values <= 0 in log)
     * at origin to avoid Three warning, and outside of camera's field of view
     * to hide them and any segments connecting them. */
    const hasFiniteCoords = Number.isFinite(x) && Number.isFinite(y);
    return hasFiniteCoords ? { x, y, z: 0 } : { x: 0, y: 0, z: CAMERA_FAR };
  };
}

export function getValueToColor(
  scaleType: ScaleType,
  domain: Domain,
  colorMap: ColorMap,
  invertColorMap: boolean
): (v: number) => RGBColor {
  const interpolator = getInterpolator(colorMap, invertColorMap);
  const numScale = createAxisScale(scaleType, { domain, range: [0, 1] });
  return (value: number) => rgb(interpolator(numScale(value)));
}
