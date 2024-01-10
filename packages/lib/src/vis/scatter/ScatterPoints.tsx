import type {
  ColorScaleType,
  Domain,
  NumArray,
} from '@h5web/shared/vis-models';
import type { ThreeEvent } from '@react-three/fiber';
import { useCallback, useMemo } from 'react';

import { useInterpolator } from '../heatmap/hooks';
import type { ColorMap } from '../heatmap/models';
import { useGeometry } from '../hooks';
import GlyphMaterial from '../line/GlyphMaterial';
import { GlyphType } from '../line/models';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { createScale } from '../utils';
import ScatterPointsGeometry from './scatterPointsGeometry';

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
    [onClick],
  );

  const handlePointerEnter = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { index } = evt;
      if (onPointerEnter && index !== undefined) {
        onPointerEnter(index, evt);
      }
    },
    [onPointerEnter],
  );

  const handlePointerOut = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { index } = evt;

      if (onPointerOut && index !== undefined) {
        onPointerOut(index, evt);
      }
    },
    [onPointerOut],
  );

  const { abscissaScale, ordinateScale } = useVisCanvasContext();

  const interpolator = useInterpolator(colorMap, invertColorMap);
  const colorScale = useMemo(
    () => createScale(scaleType, { domain, range: [0, 1] }),
    [scaleType, domain],
  );

  const geometry = useGeometry(
    ScatterPointsGeometry,
    data.length,
    {
      abscissas,
      ordinates,
      data,
      abscissaScale,
      ordinateScale,
      colorScale,
      interpolator,
    },
    true,
  );

  return (
    <points
      geometry={geometry}
      onClick={onClick && handleClick}
      onPointerEnter={onPointerEnter && handlePointerEnter}
      onPointerOut={onPointerOut && handlePointerOut}
    >
      <GlyphMaterial size={size} glyphType={GlyphType.Circle} />
    </points>
  );
}

export default ScatterPoints;
