import type { NumArray } from '@h5web/shared';
import type { Object3DNode, ThreeEvent } from '@react-three/fiber';
import { extend, useThree } from '@react-three/fiber';
import { useCallback, useLayoutEffect, useMemo } from 'react';
import { BufferGeometry, Line } from 'three';

import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { createBufferAttr } from '../utils';
import ErrorBars from './ErrorBars';
import GlyphMaterial from './GlyphMaterial';
import { useValueToErrorPositions, useValueToPosition } from './hooks';
import { CurveType, GlyphType } from './models';

/* Render points with NaN/Infinity coordinates (i.e. values <= 0 in log)
 * at origin to avoid Three warning, and outside of camera's field of view
 * to hide them and any segments connecting them. */
const CAMERA_FAR = 1000; // R3F's default

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
  abscissas: NumArray;
  ordinates: NumArray;
  errors?: NumArray;
  showErrors?: boolean;
  color: string;
  curveType?: CurveType;
  glyphType?: GlyphType;
  glyphSize?: number;
  visible?: boolean;
  onDataPointClick?: (index: number, evt: ThreeEvent<MouseEvent>) => void;
  onDataPointEnter?: (index: number, evt: ThreeEvent<PointerEvent>) => void;
  onDataPointLeave?: (index: number, evt: ThreeEvent<PointerEvent>) => void;
  ignoreValue?: (val: number) => boolean;
}

function DataCurve(props: Props) {
  const {
    abscissas,
    ordinates,
    errors,
    showErrors,
    color,
    curveType = CurveType.LineOnly,
    glyphType = GlyphType.Cross,
    glyphSize = 6,
    visible = true,
    onDataPointClick,
    onDataPointEnter,
    onDataPointLeave,
    ignoreValue,
  } = props;

  const { length } = ordinates;
  const hasErrors = !!errors;
  const { abscissaScale, ordinateScale } = useVisCanvasContext();
  const invalidate = useThree((state) => state.invalidate);

  const valueToPosition = useValueToPosition(
    abscissas,
    abscissaScale,
    ordinateScale,
    ignoreValue
  );

  const valueToErrorPositions = useValueToErrorPositions(errors, ordinateScale);

  const dataGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', createBufferAttr(length, 3));
    return geometry;
  }, [length]);

  const errorGeometries = useMemo(() => {
    if (!hasErrors) {
      return undefined;
    }

    const geometries = {
      caps: new BufferGeometry(),
      bars: new BufferGeometry(),
    };

    geometries.caps.setAttribute('position', createBufferAttr(length * 2, 3));
    geometries.bars.setAttribute('position', createBufferAttr(length * 2, 3));

    return geometries;
  }, [hasErrors, length]);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useLayoutEffect(() => {
    const { position: dataPosition } = dataGeometry.attributes;
    const errorPositions = errorGeometries && {
      caps: errorGeometries.caps.attributes.position,
      bars: errorGeometries.bars.attributes.position,
    };

    ordinates.forEach((value, index) => {
      const pos = valueToPosition(value, index);

      if (pos) {
        dataPosition.setXYZ(index, pos[0], pos[1], 0);
      } else {
        dataPosition.setXYZ(index, 0, 0, CAMERA_FAR);
      }

      if (!errorPositions) {
        return;
      }

      const { topCap, bottomCap, bar } = valueToErrorPositions(
        value,
        index,
        pos
      );

      if (topCap) {
        errorPositions.caps.setXYZ(index * 2 + 1, topCap[0], topCap[1], 0);
      } else {
        errorPositions.caps.setXYZ(index * 2 + 1, 0, 0, CAMERA_FAR);
      }

      if (bottomCap) {
        errorPositions.caps.setXYZ(index * 2, bottomCap[0], bottomCap[1], 0);
      } else {
        errorPositions.caps.setXYZ(index * 2, 0, 0, CAMERA_FAR);
      }

      if (bar) {
        errorPositions.bars.setXYZ(index * 2, bar[0], bar[1], 0);
        errorPositions.bars.setXYZ(index * 2 + 1, bar[2], bar[3], 0);
      } else {
        errorPositions.bars.setXYZ(index * 2, 0, 0, CAMERA_FAR);
        errorPositions.bars.setXYZ(index * 2 + 1, 0, 0, CAMERA_FAR);
      }
    });

    dataGeometry.computeBoundingSphere();
    dataPosition.needsUpdate = true;
    if (errorPositions) {
      errorPositions.caps.needsUpdate = true;
      errorPositions.bars.needsUpdate = true;
    }

    invalidate();
  }, [
    ordinates,
    dataGeometry,
    errorGeometries,
    valueToErrorPositions,
    valueToPosition,
    invalidate,
  ]);

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
      <line_ visible={showLine} geometry={dataGeometry}>
        <lineBasicMaterial color={color} />
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
      {errorGeometries && (
        <ErrorBars
          geometries={errorGeometries}
          color={color}
          visible={visible && showErrors}
        />
      )}
    </>
  );
}

export type { Props as DataCurveProps };
export default DataCurve;
