import React, { Suspense, ReactElement, useMemo } from 'react';
import { Line } from 'react-three-fiber/components';
import { CurveType } from './models';
import DataGlyphs from './DataGlyphs';
import { useThree } from 'react-three-fiber';
import { BufferGeometry, Vector3 } from 'three';
import { useCanvasScales } from '../shared/hooks';

const DEFAULT_COLOR = '#1b998b';

interface Props {
  abscissas: number[];
  ordinates: number[];
  color?: string;
  curveType?: CurveType;
}

function DataCurve(props: Props): ReactElement {
  const {
    abscissas,
    ordinates,
    color = DEFAULT_COLOR,
    curveType = CurveType.LineOnly,
  } = props;

  const { camera } = useThree();
  const { abscissaScale, ordinateScale } = useCanvasScales();

  const dataGeometry = useMemo(() => {
    const points = ordinates.map((val, index) => {
      const ordinate = ordinateScale(val);
      return new Vector3(
        abscissaScale(abscissas[index]),
        // This is to avoid a three.js warning when ordinateScale(val) is Infinity
        Number.isFinite(ordinate) ? ordinate : 0,
        // Move NaN/Infinity out of the camera FOV (negative val for logScale).
        // This allows to have only curve segments for the positive values
        Number.isFinite(ordinate) ? 0 : camera.far
      );
    });

    const geometry = new BufferGeometry();
    geometry.setFromPoints(points);
    return geometry;
  }, [abscissaScale, abscissas, camera, ordinateScale, ordinates]);

  const showLine = curveType !== CurveType.GlyphsOnly;
  const showGlyphs = curveType !== CurveType.LineOnly;

  return (
    <Suspense fallback={<></>}>
      <DataGlyphs
        geometry={dataGeometry}
        color={color}
        visible={showGlyphs}
        size={6}
      />
      <Line geometry={dataGeometry} visible={showLine}>
        <lineBasicMaterial attach="material" color={color} linewidth={2} />
      </Line>
    </Suspense>
  );
}

export default DataCurve;
