import { format } from 'd3-format';
import type { NdArray } from 'ndarray';
import { useContext, useMemo } from 'react';
import { Vector3 } from 'three';
import { useValueToIndexScale } from '../hooks';
import type { TooltipIndexFormatter, TooltipValueFormatter } from '../models';
import AxisSystemContext from '../shared/AxisSystemContext';

const CAMERA_FAR = 1000; // R3F's default

export function useCanvasPoints(
  abscissas: number[],
  ordinates: number[],
  errors?: number[]
) {
  const { abscissaScale, ordinateScale } = useContext(AxisSystemContext);

  return useMemo(() => {
    const dataPoints: Vector3[] = [];
    const errorBarSegments: Vector3[] = [];
    const errorCapPoints: Vector3[] = [];

    ordinates.forEach((val, index) => {
      const x = abscissaScale(abscissas[index]);
      const y = ordinateScale(val);

      const hasFiniteCoords = Number.isFinite(x) && Number.isFinite(y);
      const dataVector = hasFiniteCoords
        ? new Vector3(x, y, 0)
        : /* Render points with NaN/Infinity coordinates (i.e. values <= 0 in log)
           * at origin to avoid Three warning, and outside of camera's field of view
           * to hide them and any segments connecting them. */
          new Vector3(0, 0, CAMERA_FAR);

      dataPoints.push(dataVector);

      const error = errors && errors[index];
      if (!error || !hasFiniteCoords) {
        return;
      }

      const yErrBottom = ordinateScale(val - error);
      const yErrTop = ordinateScale(val + error);

      if (Number.isFinite(yErrBottom)) {
        const errBottomVector = new Vector3(x, yErrBottom, 0);
        errorBarSegments.push(errBottomVector, dataVector);
        errorCapPoints.push(errBottomVector);
      }

      if (Number.isFinite(yErrTop)) {
        const errTopVector = new Vector3(x, yErrTop, 0);
        errorBarSegments.push(dataVector, errTopVector);
        errorCapPoints.push(errTopVector);
      }
    });

    return { data: dataPoints, bars: errorBarSegments, caps: errorCapPoints };
  }, [abscissaScale, abscissas, errors, ordinateScale, ordinates]);
}

export function useTooltipFormatters(
  abscissas: number[],
  abscissaLabel: string | undefined,
  dataArray: NdArray,
  errorsArray: NdArray | undefined
): {
  formatIndex: TooltipIndexFormatter;
  formatValue: TooltipValueFormatter;
} {
  const abscissaToIndex = useValueToIndexScale(abscissas, true);

  return {
    formatIndex: ([x]) =>
      `${abscissaLabel || 'x'}=${format('0')(abscissas[abscissaToIndex(x)])}`,

    formatValue: ([x]) => {
      const index = abscissaToIndex(x);
      const value = dataArray.get(index);

      if (value === undefined) {
        return undefined;
      }

      const error = errorsArray && errorsArray.get(index);
      return error
        ? `${format('.3f')(value)} ±${format('.3f')(error)}`
        : `${format('.3f')(value)}`;
    },
  };
}
