import type { Domain, NumArray, ScaleType } from '@h5web/shared';
import { useThree } from '@react-three/fiber';
import { rgb } from 'd3-color';
import { useLayoutEffect, useMemo, useState } from 'react';
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
  } = props;

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

  return (
    <points geometry={dataGeometry}>
      <GlyphMaterial size={size} glyphType={GlyphType.Circle} />
    </points>
  );
}

export default ScatterPoints;
