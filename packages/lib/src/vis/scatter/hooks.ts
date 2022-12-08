import type { Domain, NumArray, ScaleType } from '@h5web/shared';
import { rgb } from 'd3-color';
import { useMemo } from 'react';

import type { ColorMap } from '../heatmap/models';
import { getInterpolator } from '../heatmap/utils';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { createAxisScale } from '../utils';

const CAMERA_FAR = 1000; // R3F's default

export function useBufferAttributes(
  abscissas: number[],
  ordinates: number[],
  data: NumArray,
  dataToColorScale: (val: number) => [number, number, number]
) {
  const { abscissaScale, ordinateScale } = useVisCanvasContext();

  return useMemo(() => {
    const position = new Float32Array(3 * data.length);
    const color = new Uint8Array(3 * data.length);

    data.forEach((val, index) => {
      color.set(dataToColorScale(val), 3 * index);

      const x = abscissaScale(abscissas[index]);
      const y = ordinateScale(ordinates[index]);

      const hasFiniteCoords = Number.isFinite(x) && Number.isFinite(y);

      /* Render points with NaN/Infinity coordinates (i.e. values <= 0 in log)
       * at origin to avoid Three warning, and outside of camera's field of view
       * to hide them and any segments connecting them. */
      position.set([x, y, hasFiniteCoords ? 0 : CAMERA_FAR], 3 * index);
    });

    return { position, color };
  }, [
    abscissaScale,
    abscissas,
    dataToColorScale,
    data,
    ordinateScale,
    ordinates,
  ]);
}

export function useDataToColorScale(
  scaleType: ScaleType,
  domain: Domain,
  colorMap: ColorMap,
  invertColorMap: boolean
): (v: number) => [number, number, number] {
  return useMemo(() => {
    const numScale = createAxisScale(scaleType, {
      domain,
      range: [0, 1],
    });
    const interpolator = getInterpolator(colorMap, invertColorMap);
    return (value: number) => {
      const color = rgb(interpolator(numScale(value)));
      return [color.r, color.g, color.b];
    };
  }, [colorMap, domain, invertColorMap, scaleType]);
}
