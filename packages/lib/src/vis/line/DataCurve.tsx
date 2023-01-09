import type { NumArray } from '@h5web/shared';
import { extend, useThree } from '@react-three/fiber';
import type { Object3DNode, ThreeEvent } from '@react-three/fiber';
import { useCallback, useLayoutEffect, useState } from 'react';
import { BufferGeometry, Line, } from 'three';

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

interface Props {
  abscissas: number[];
  ordinates: NumArray;
  errors?: NumArray;
  showErrors?: boolean;
  color: string;
  linewidth?: number;
  dashSize?: number;
  gapSize?: number;
  curveType?: CurveType;
  glyphType?: GlyphType;
  glyphSize?: number;
  visible?: boolean;
  onDataPointClick?: (index: number, evt: ThreeEvent<MouseEvent>) => void;
  onDataPointEnter?: (index: number, evt: ThreeEvent<PointerEvent>) => void;
  onDataPointLeave?: (index: number, evt: ThreeEvent<PointerEvent>) => void;
}

function DataCurve(props: Props) {
  const {
    abscissas,
    ordinates,
    errors,
    showErrors,
    color,
    linewidth = 1,
    dashSize = 3,
    gapSize = 0,
    curveType = CurveType.LineOnly,
    glyphType = GlyphType.Cross,
    glyphSize = 6,
    visible = true,
    onDataPointClick,
    onDataPointEnter,
    onDataPointLeave,
  } = props;

  const points = useCanvasPoints(abscissas, ordinates, errors);
  const [dataGeometry] = useState(() => new BufferGeometry());
  dataGeometry.setFromPoints(points.data);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    dataGeometry.setFromPoints(points.data);
    dataGeometry.computeBoundingSphere();
    invalidate();
  }, [dataGeometry, invalidate, points.data]);

  const handleClick = useCallback(
    (evt: ThreeEvent<MouseEvent>) => {
      const { index } = evt;

      if (onDataPointClick && index !== undefined) {
        onDataPointClick(index, evt);
      }
    },
    [onDataPointClick]
  );

  const handlePointerEnter = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { index } = evt;

      if (onDataPointEnter && index !== undefined) {
        onDataPointEnter(index, evt);
      }
    },
    [onDataPointEnter]
  );

  const handlePointerLeave = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { index } = evt;

      if (onDataPointLeave && index !== undefined) {
        onDataPointLeave(index, evt);
      }
    },
    [onDataPointLeave]
  );

  const showLine = visible && curveType !== CurveType.GlyphsOnly;
  const showGlyphs = visible && curveType !== CurveType.LineOnly;

  return (
    <>
      <line_
        visible={showLine}
        onUpdate={(line_) => line_.computeLineDistances()}
        geometry={dataGeometry}
      >
        <lineDashedMaterial
          color={color}
          linewidth={linewidth}
          dashSize={dashSize}
          gapSize={gapSize}
        />
      </line_>
      <points
        visible={showGlyphs}
        geometry={dataGeometry}
        onClick={onDataPointClick && handleClick}
        onPointerEnter={onDataPointEnter && handlePointerEnter}
        onPointerLeave={onDataPointLeave && handlePointerLeave}
      >
        <GlyphMaterial glyphType={glyphType} color={color} size={glyphSize} />
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
