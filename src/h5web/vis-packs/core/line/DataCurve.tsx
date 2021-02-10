import { Suspense, ReactElement, useMemo } from 'react';
import { Line } from 'react-three-fiber/components';
import { CurveType } from './models';
import GlyphMaterial from './GlyphMaterial';
import { useThree } from 'react-three-fiber';
import { BufferGeometry, Vector3 } from 'three';
import { useCanvasScales } from '../hooks';
import ErrorBars from './ErrorBars';

interface Props {
  abscissas: number[];
  ordinates: number[];
  errors?: number[];
  showErrors?: boolean;
  color?: string;
  curveType?: CurveType;
}

function DataCurve(props: Props): ReactElement {
  const {
    abscissas,
    ordinates,
    errors,
    showErrors,
    color,
    curveType = CurveType.LineOnly,
  } = props;

  const { camera, gl } = useThree();
  const { abscissaScale, ordinateScale } = useCanvasScales();

  const curveColor =
    color || window.getComputedStyle(gl.domElement).getPropertyValue('color');

  const points = useMemo(() => {
    const dataPoints: Vector3[] = [];
    const errorBarSegments: Vector3[] = [];
    const errorCapPoints: Vector3[] = [];

    ordinates.forEach((val, index) => {
      const x = abscissaScale(abscissas[index]);
      const y = ordinateScale(val);

      const finiteData = Number.isFinite(x) && Number.isFinite(y);
      const dataVector = finiteData
        ? // Set x,y to 0 to avoid a three.js warning when one is Infinity
          new Vector3(x, y, 0)
        : // Move NaN/Infinity out of the camera FOV (negative val for logScale).
          // This allows to have only curve segments for the positive values
          new Vector3(0, 0, camera.far);

      dataPoints.push(dataVector);

      const error = errors && errors[index];
      if (!error || !finiteData) {
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
  }, [abscissaScale, abscissas, camera.far, errors, ordinateScale, ordinates]);

  const dataGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setFromPoints(points.data);
    return geometry;
  }, [points.data]);

  const showLine = curveType !== CurveType.GlyphsOnly;
  const showGlyphs = curveType !== CurveType.LineOnly;

  return (
    <Suspense fallback={<></>}>
      <Line visible={showLine} geometry={dataGeometry}>
        <lineBasicMaterial attach="material" color={curveColor} linewidth={2} />
      </Line>
      <points visible={showGlyphs} geometry={dataGeometry}>
        <GlyphMaterial color={curveColor} size={6} />
      </points>
      {showErrors && errors && (
        <ErrorBars
          barsSegments={points.bars}
          capsPoints={points.caps}
          color={curveColor}
        />
      )}
    </Suspense>
  );
}

export default DataCurve;
