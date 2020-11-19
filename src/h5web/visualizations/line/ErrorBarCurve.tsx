import React, { ReactElement, useMemo } from 'react';
import { LineSegments } from 'react-three-fiber/components';
import { BufferGeometry } from 'three';
import { lineSegment } from '../shared/utils';
import { useCanvasScales } from '../shared/hooks';

const DEFAULT_COLOR = '#1b998b';

const CAP_LENGTH = 10;

interface Props {
  abscissas: number[];
  ordinates: number[];
  errors: number[];
  color?: string;
  capLength?: number;
  visible?: boolean;
}

function ErrorBarCurve(props: Props): ReactElement {
  const {
    abscissas,
    ordinates,
    errors,
    color = DEFAULT_COLOR,
    capLength = CAP_LENGTH,
    visible,
  } = props;

  const { abscissaScale, ordinateScale } = useCanvasScales();

  const errorGeometry = useMemo(() => {
    const points = ordinates.flatMap((val, index) => {
      const [x, y] = [abscissaScale(abscissas[index]), ordinateScale(val)];

      if (!Number.isFinite(y)) {
        return [];
      }

      const error = errors[index];
      if (error === 0) {
        return [];
      }
      const yerr_min = ordinateScale(val - error);
      const yerr_max = ordinateScale(val + error);

      return [
        // First segment: bottom cap
        ...lineSegment(
          x - capLength / 2,
          yerr_min,
          x + capLength / 2,
          yerr_min
        ),
        // Second segment: bottom error bar
        ...lineSegment(x, yerr_min, x, y),
        // Third segment: top error bar
        ...lineSegment(x, y, x, yerr_max),
        // Fourth segment: top cap
        ...lineSegment(
          x - capLength / 2,
          yerr_max,
          x + capLength / 2,
          yerr_max
        ),
      ];
    });

    const geometry = new BufferGeometry();
    geometry.setFromPoints(points);
    return geometry;
  }, [abscissaScale, abscissas, capLength, errors, ordinateScale, ordinates]);

  return (
    <LineSegments visible={visible} geometry={errorGeometry}>
      <lineBasicMaterial attach="material" color={color} linewidth={2} />
    </LineSegments>
  );
}

export default ErrorBarCurve;
