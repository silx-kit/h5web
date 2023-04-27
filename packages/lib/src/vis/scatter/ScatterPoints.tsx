import type { ColorScaleType, Domain, NumArray } from '@h5web/shared';
import type { ThreeEvent } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useCallback, useLayoutEffect, useMemo } from 'react';
import { BufferGeometry } from 'three';

import type { ColorMap } from '../heatmap/models';
import GlyphMaterial from '../line/GlyphMaterial';
import { GlyphType } from '../line/models';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { createBufferAttr } from '../utils';
import { useIndexToPosition, useValueToColor } from './hooks';

interface Props {
  abscissas: NumArray;
  ordinates: NumArray;
  data: NumArray;
  domain: Domain;
  scaleType: ColorScaleType;
  colorMap: ColorMap;
  invertColorMap: boolean;
  size: number;
  onClick?: (index: number, evt: ThreeEvent<MouseEvent>) => void;
  onPointerEnter?: (index: number, evt: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (index: number, evt: ThreeEvent<PointerEvent>) => void;
}

function ScatterPoints(props: Props) {
  const {
    abscissas,
    ordinates,
    data,
    domain,
    scaleType,
    colorMap,
    invertColorMap,
    size,
    onClick,
    onPointerEnter,
    onPointerOut,
  } = props;

  const handleClick = useCallback(
    (evt: ThreeEvent<MouseEvent>) => {
      const { index } = evt;

      if (onClick && index !== undefined) {
        onClick(index, evt);
      }
    },
    [onClick]
  );

  const handlePointerEnter = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { index } = evt;
      if (onPointerEnter && index !== undefined) {
        onPointerEnter(index, evt);
      }
    },
    [onPointerEnter]
  );

  const handlePointerOut = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { index } = evt;

      if (onPointerOut && index !== undefined) {
        onPointerOut(index, evt);
      }
    },
    [onPointerOut]
  );

  const { length } = data;
  const { abscissaScale, ordinateScale } = useVisCanvasContext();
  const invalidate = useThree((state) => state.invalidate);

  const indexToPosition = useIndexToPosition(
    abscissas,
    abscissaScale,
    ordinates,
    ordinateScale
  );

  const valueToColor = useValueToColor(
    scaleType,
    domain,
    colorMap,
    invertColorMap
  );

  const dataGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', createBufferAttr(length, 3));
    geometry.setAttribute('color', createBufferAttr(length, 3));
    return geometry;
  }, [length]);

  useLayoutEffect(() => {
    const { color, position } = dataGeometry.attributes;

    data.forEach((val, index) => {
      const { x, y, z } = indexToPosition(index);
      position.setXYZ(index, x, y, z);

      const { r, g, b } = valueToColor(val);
      color.setXYZ(index, r / 255, g / 255, b / 255); // normalize RGB channels
    });

    color.needsUpdate = true;
    position.needsUpdate = true;
    invalidate();
  }, [data, dataGeometry, indexToPosition, valueToColor, invalidate]);

  return (
    <points
      onClick={onClick && handleClick}
      onPointerEnter={onPointerEnter && handlePointerEnter}
      onPointerOut={onPointerOut && handlePointerOut}
      geometry={dataGeometry}
    >
      <GlyphMaterial size={size} glyphType={GlyphType.Circle} />
    </points>
  );
}

export default ScatterPoints;
