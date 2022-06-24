import type { NumArray } from '@h5web/shared';
import { extend, useThree } from '@react-three/fiber';
import type { Object3DNode, ThreeEvent } from '@react-three/fiber';
import { useCallback, useLayoutEffect, useState } from 'react';
import { BufferGeometry, Line } from 'three';

import { useRaycasterThreshold } from '../hooks';
import ErrorBars from './ErrorBars';
import GlyphMaterial from './GlyphMaterial';
import { useCanvasPoints } from './hooks';
import { CurveType, GlyphType } from './models';

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

const LINE_WIDTH = 2;

interface Props {
  abscissas: number[];
  ordinates: NumArray;
  errors?: NumArray;
  showErrors?: boolean;
  color: string;
  curveType?: CurveType;
  visible?: boolean;
  onLineClick?: (index: number, evt: ThreeEvent<MouseEvent>) => void;
}

function DataCurve(props: Props) {
  const {
    abscissas,
    ordinates,
    errors,
    showErrors,
    color,
    curveType = CurveType.LineOnly,
    visible = true,
    onLineClick,
  } = props;

  const [dataGeometry] = useState(() => new BufferGeometry());
  const points = useCanvasPoints(abscissas, ordinates, errors);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    dataGeometry.setFromPoints(points.data);
    dataGeometry.computeBoundingSphere();
    invalidate();
  }, [dataGeometry, invalidate, points.data]);

  useRaycasterThreshold('Line', LINE_WIDTH);

  const handleClick = useCallback(
    (evt: ThreeEvent<MouseEvent>) => {
      const { index } = evt;

      if (onLineClick && index !== undefined) {
        onLineClick(index, evt);
      }
    },
    [onLineClick]
  );

  const showLine = visible && curveType !== CurveType.GlyphsOnly;
  const showGlyphs = visible && curveType !== CurveType.LineOnly;

  return (
    <>
      <line_
        visible={showLine}
        geometry={dataGeometry}
        onClick={onLineClick && handleClick}
      >
        <lineBasicMaterial color={color} linewidth={LINE_WIDTH} />
      </line_>
      <points visible={showGlyphs} geometry={dataGeometry}>
        <GlyphMaterial glyphType={GlyphType.Cross} color={color} size={6} />
      </points>
      {showErrors && errors && (
        <ErrorBars
          barsSegments={points.bars}
          capsPoints={points.caps}
          color={color}
          visible={visible}
        />
      )}
    </>
  );
}

export type { Props as DataCurveProps };
export default DataCurve;
