import React, { ReactElement, Suspense, useMemo } from 'react';
import { LineSegments } from 'react-three-fiber/components';
import { BufferGeometry, Vector2 } from 'three';
import { useCanvasScales } from '../shared/hooks';
import DataGlyphs from './DataGlyphs';
import { GLYPH_URLS } from './models';

const DEFAULT_COLOR = '#1b998b';

interface Props {
  abscissas: number[];
  ordinates: number[];
  errors: number[];
  color?: string;
  visible?: boolean;
}

function ErrorBarCurve(props: Props): ReactElement {
  const {
    abscissas,
    ordinates,
    errors,
    color = DEFAULT_COLOR,
    visible,
  } = props;

  const { abscissaScale, ordinateScale } = useCanvasScales();

  const [barsGeometry, capsGeometry] = useMemo(() => {
    const capPoints: Vector2[] = [];
    const barSegments: Vector2[] = [];

    for (const index of ordinates.keys()) {
      const ordinate = ordinates[index];
      const x = abscissaScale(abscissas[index]);
      const y = ordinateScale(ordinate);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        continue;
      }
      const error = errors[index];
      if (error === 0) {
        continue;
      }

      const yBottom = ordinateScale(ordinate - error);
      const yTop = ordinateScale(ordinate + error);

      const xyVector = new Vector2(x, y);

      if (Number.isFinite(yBottom)) {
        const bottomVector = new Vector2(x, yBottom);
        capPoints.push(bottomVector);
        barSegments.push(xyVector, bottomVector);
      }

      if (Number.isFinite(yTop)) {
        const topVector = new Vector2(x, yTop);
        capPoints.push(topVector);
        barSegments.push(xyVector, topVector);
      }
    }

    return [barSegments, capPoints].map((points) => {
      const geometry = new BufferGeometry();
      geometry.setFromPoints(points);
      return geometry;
    });
  }, [abscissaScale, abscissas, errors, ordinateScale, ordinates]);

  return (
    <Suspense fallback={<></>}>
      <LineSegments visible={visible} geometry={barsGeometry}>
        <lineBasicMaterial attach="material" color={color} linewidth={2} />
      </LineSegments>
      <DataGlyphs
        visible={visible}
        geometry={capsGeometry}
        glyphURL={GLYPH_URLS.Cap}
        color={color}
        size={8}
      />
    </Suspense>
  );
}

export default ErrorBarCurve;
