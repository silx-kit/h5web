import { getDims } from '@h5web/shared';
import { LinearFilter } from 'three';

import HeatmapMaterial from '../heatmap/HeatmapMaterial';
import { useTextureSafeNdArray } from '../heatmap/hooks';
import { useGeometry } from '../hooks';
import GlyphMaterial from '../line/GlyphMaterial';
import { GlyphType } from '../line/models';
import SurfaceMeshGeometry from './surfaceMeshGeometry';
import type { SurfaceVisProps } from './SurfaceVis';

type Props = Required<SurfaceVisProps>;

function SurfaceMesh(props: Props) {
  const { dataArray, domain, colorMap, invertColorMap, scaleType, showPoints } =
    props;

  const { rows, cols } = getDims(dataArray);
  const safeDataArray = useTextureSafeNdArray(dataArray);

  const geometry = useGeometry(SurfaceMeshGeometry, dataArray.size, {
    values: dataArray.data,
    rows,
    cols,
  });

  return (
    <group position={[-cols / 2, -rows / 2, 0]}>
      <mesh geometry={geometry}>
        <HeatmapMaterial
          values={safeDataArray}
          domain={domain}
          colorMap={colorMap}
          scaleType={scaleType}
          invertColorMap={invertColorMap}
          magFilter={LinearFilter}
        />
      </mesh>
      <points geometry={geometry} visible={showPoints}>
        <GlyphMaterial size={5} glyphType={GlyphType.Circle} color="black" />
      </points>
    </group>
  );
}

export default SurfaceMesh;
