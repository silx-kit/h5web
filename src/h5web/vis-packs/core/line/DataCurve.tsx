import { Suspense, useMemo } from 'react';
import { Line } from 'react-three-fiber/components';
import { CurveType } from './models';
import GlyphMaterial from './GlyphMaterial';
import { useThree } from 'react-three-fiber';
import { BufferGeometry } from 'three';
import ErrorBars from './ErrorBars';
import { useCanvasPoints } from './hooks';

interface Props {
  abscissas: number[];
  ordinates: number[];
  errors?: number[];
  showErrors?: boolean;
  color?: string;
  curveType?: CurveType;
}

function DataCurve(props: Props) {
  const {
    abscissas,
    ordinates,
    errors,
    showErrors,
    color = '--secondary-dark',
    curveType = CurveType.LineOnly,
  } = props;

  const { gl } = useThree();
  const curveColor = color.startsWith('--')
    ? window.getComputedStyle(gl.domElement).getPropertyValue(color).trim()
    : color;

  const points = useCanvasPoints(abscissas, ordinates, errors);

  const dataGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setFromPoints(points.data);
    return geometry;
  }, [points.data]);

  const showLine = curveType !== CurveType.GlyphsOnly;
  const showGlyphs = curveType !== CurveType.LineOnly;

  return (
    <Suspense fallback={null}>
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
