import { Suspense, useMemo } from 'react';
import { CurveType } from './models';
import GlyphMaterial from './GlyphMaterial';
import { extend, useThree } from '@react-three/fiber';
import { BufferGeometry, Line } from 'three';
import ErrorBars from './ErrorBars';
import { useCanvasPoints } from './hooks';
import type { Object3DNode } from '@react-three/fiber';

extend({ Line_: Line });

// https://github.com/pmndrs/react-three-fiber/issues/1152
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      line_: Object3DNode<Line, typeof Line>;
    }
  }
}

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

  const { domElement } = useThree((state) => state.gl);
  const curveColor = color.startsWith('--')
    ? window.getComputedStyle(domElement).getPropertyValue(color).trim()
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
      <line_ visible={showLine} geometry={dataGeometry}>
        <lineBasicMaterial color={curveColor} linewidth={2} />
      </line_>
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
