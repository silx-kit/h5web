import type { NumArray } from '@h5web/shared';
import { extend, useThree } from '@react-three/fiber';
import type {
  MaterialNode,
  Object3DNode,
  ThreeEvent,
} from '@react-three/fiber';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { BufferGeometry, Color, Line, Vector2, type Vector3 } from 'three';
import {
  Line2,
  LineGeometry,
  LineMaterial,
  type LineMaterialParameters,
} from 'three-stdlib';

import ErrorBars from './ErrorBars';
import GlyphMaterial from './GlyphMaterial';
import { useCanvasPoints } from './hooks';
import { CurveType, GlyphType } from './models';

extend({ Line_: Line, Line2_: Line2, LineMaterial });

// https://github.com/pmndrs/react-three-fiber/issues/1152
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      line_: Object3DNode<Line, typeof Line>;
      line2_: Object3DNode<Line2, typeof Line2>;
      lineMaterial: MaterialNode<LineMaterial, LineMaterialParameters>;
    }
  }
}

interface Props {
  abscissas: number[];
  ordinates: NumArray;
  errors?: NumArray;
  showErrors?: boolean;
  color: string;
  lineWidth?: number;
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

function flattenCoordinates(points: Vector3[]): number[] {
  const coords: number[] = [];
  points.forEach((p) => {
    coords.push(p.x, p.y, p.z);
  });
  return coords;
}

function DataCurve(props: Props) {
  const {
    abscissas,
    ordinates,
    errors,
    showErrors,
    color,
    lineWidth = 1,
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

  const showLine = visible && curveType !== CurveType.GlyphsOnly;
  const showGlyphs = visible && curveType !== CurveType.LineOnly;

  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const points = useCanvasPoints(abscissas, ordinates, errors);
  const bufferGeometry = useState(() => new BufferGeometry())[0];
  const lineGeometry = useState(() => new LineGeometry())[0];

  function getFlatData(): number[] {
    return lineWidth === 1 ? [] : flattenCoordinates(points.data);
  }
  const flatData = useMemo(getFlatData, [lineWidth, points.data]);
  if (lineWidth === 1 || showGlyphs) {
    bufferGeometry.setFromPoints(points.data);
  } else {
    lineGeometry.setPositions(flatData);
  }
  useLayoutEffect(() => {
    bufferGeometry.setFromPoints(points.data);
    invalidate();
  }, [bufferGeometry, invalidate, points.data]);
  useLayoutEffect(() => {
    lineGeometry.setPositions(flatData);
    invalidate();
  }, [lineGeometry, invalidate, flatData]);

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

  return (
    <>
      {lineWidth === 1 ? (
        <line_
          visible={showLine}
          onUpdate={(line_) => line_.computeLineDistances()}
          geometry={bufferGeometry}
        >
          {gapSize === 0 ? (
            <lineBasicMaterial color={color} />
          ) : (
            <lineDashedMaterial
              color={color}
              dashSize={dashSize}
              gapSize={gapSize}
            />
          )}
        </line_>
      ) : (
        <line2_
          visible={showLine}
          onUpdate={(line_) => line_.computeLineDistances()}
          geometry={lineGeometry}
        >
          <lineMaterial
            color={new Color(color).getHex()}
            dashed={gapSize > 0}
            linewidth={lineWidth}
            dashSize={dashSize}
            gapSize={gapSize}
            resolution={new Vector2(size.width, size.height)}
          />
        </line2_>
      )}
      <points
        visible={showGlyphs}
        geometry={bufferGeometry}
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
