import type { Domain, NumArray, ScaleType } from '@h5web/shared';
import type { ThreeEvent } from '@react-three/fiber';
import { useFrame, useThree } from '@react-three/fiber';
import { rgb } from 'd3-color';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { BufferAttribute, BufferGeometry } from 'three';

import type { ColorMap } from '../heatmap/models';
import { getInterpolator } from '../heatmap/utils';
import GlyphMaterial from '../line/GlyphMaterial';
import { GlyphType } from '../line/models';
import { createAxisScale } from '../utils';
import { useBufferAttributes } from './hooks';

interface Props {
  abscissas: number[];
  ordinates: number[];
  data: NumArray;
  domain: Domain;
  scaleType: ScaleType;
  colorMap: ColorMap;
  invertColorMap: boolean;
  size: number;
  onClick?: (index: number | undefined, evt: ThreeEvent<MouseEvent>) => void;
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
  } = props;

  // Increase raycaster threshold to match point size
  const raycaster = useThree((state) => state.raycaster);
  useEffect(() => {
    const oldThreshold = raycaster.params.Points?.threshold || 1;
    if (raycaster.params.Points) {
      raycaster.params.Points.threshold = size / 2;
    }

    return () => {
      if (raycaster.params.Points) {
        raycaster.params.Points.threshold = oldThreshold;
      }
    };
  }, [raycaster, size]);

  useFrame(() => {
    // Consider that the zoom is the same in X and Y (regular non-axial zoom) as we can't have oval points
    const zoom = zoomVector.x;
    if (raycaster.params.Points) {
      raycaster.params.Points.threshold = (size * zoom) / 2;
    }
  });

  function handleClick(evt: ThreeEvent<MouseEvent>) {
    const { index } = evt;

    if (onClick) {
      onClick(index, evt);
    }
  }

  const [dataGeometry] = useState(() => new BufferGeometry());
  const invalidate = useThree((state) => state.invalidate);

  const dataToColorScale = useMemo(() => {
    const numScale = createAxisScale(scaleType, {
      domain,
      range: [0, 1],
    });
    const interpolator = getInterpolator(colorMap, invertColorMap);
    return (value: number) => {
      const color = rgb(interpolator(numScale(value)));
      return [color.r, color.g, color.b] as [number, number, number];
    };
  }, [colorMap, domain, invertColorMap, scaleType]);

  const { position, color } = useBufferAttributes(
    abscissas,
    ordinates,
    data,
    dataToColorScale
  );

  useLayoutEffect(() => {
    dataGeometry.setAttribute('position', new BufferAttribute(position, 3));
    dataGeometry.setAttribute('color', new BufferAttribute(color, 3, true));
    invalidate();
  }, [color, dataGeometry, invalidate, position]);

  const zoomVector = useThree((state) => state.camera.scale);

  return (
    <points onClick={handleClick} geometry={dataGeometry}>
      <GlyphMaterial size={size} glyphType={GlyphType.Circle} />
    </points>
  );
}

export default ScatterPoints;
