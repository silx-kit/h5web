import { getDims } from '@h5web/shared';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useState } from 'react';
import { BufferGeometry, LinearFilter } from 'three';

import HeatmapMaterial from '../heatmap/HeatmapMaterial';
import { useTextureSafeNdArray } from '../heatmap/hooks';
import GlyphMaterial from '../line/GlyphMaterial';
import { GlyphType } from '../line/models';
import type { SurfaceVisProps } from './SurfaceVis';
import { useBufferAttributes } from './hooks';

type Props = Required<SurfaceVisProps>;

function SurfaceMesh(props: Props) {
  const { dataArray, domain, colorMap, invertColorMap, scaleType, showPoints } =
    props;

  const { rows, cols } = getDims(dataArray);

  const [dataGeometry] = useState(() => new BufferGeometry());
  const invalidate = useThree((state) => state.invalidate);

  const safeDataArray = useTextureSafeNdArray(dataArray);

  const { position, index, uv } = useBufferAttributes(dataArray);

  useLayoutEffect(() => {
    dataGeometry.setAttribute('position', position);
    dataGeometry.setAttribute('uv', uv);
    dataGeometry.setIndex(index);
    invalidate();
  }, [dataGeometry, invalidate, position, index, uv]);

  return (
    <group position={[-cols / 2, -rows / 2, 0]}>
      <mesh geometry={dataGeometry}>
        <HeatmapMaterial
          values={safeDataArray}
          domain={domain}
          colorMap={colorMap}
          scaleType={scaleType}
          invertColorMap={invertColorMap}
          magFilter={LinearFilter}
        />
      </mesh>
      {showPoints && (
        <points geometry={dataGeometry}>
          <GlyphMaterial size={5} glyphType={GlyphType.Circle} color="black" />
        </points>
      )}
    </group>
  );
}

export default SurfaceMesh;
