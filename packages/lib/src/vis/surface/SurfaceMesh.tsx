import {
  type ColorScaleType,
  type Domain,
  type NumArray,
} from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';
import { useMemo } from 'react';
import { DoubleSide, LinearFilter } from 'three';

import HeatmapMaterial from '../heatmap/HeatmapMaterial';
import { useTextureSafeNdArray } from '../heatmap/hooks';
import { type D3Interpolator } from '../heatmap/models';
import { useUpdateGeometry } from '../hooks';
import GlyphMaterial from '../line/GlyphMaterial';
import { GlyphType } from '../line/models';
import SurfaceMeshGeometry from './surfaceMeshGeometry';

interface Props {
  dataArray: NdArray<NumArray>;
  domain: Domain;
  scaleType: ColorScaleType;
  interpolator: D3Interpolator;
  showPoints: boolean;
}

function SurfaceMesh(props: Props) {
  const { dataArray, domain, interpolator, scaleType, showPoints } = props;

  const [rows, cols] = dataArray.shape;
  const safeDataArray = useTextureSafeNdArray(dataArray);

  const geometry = useMemo(
    () => new SurfaceMeshGeometry({ dataArray, rows, cols }),
    [dataArray, rows, cols],
  );

  useUpdateGeometry(geometry);

  return (
    <group position={[-cols / 2, -rows / 2, 0]}>
      <mesh geometry={geometry}>
        <HeatmapMaterial
          values={safeDataArray}
          domain={domain}
          interpolator={interpolator}
          scaleType={scaleType}
          magFilter={LinearFilter}
          side={DoubleSide}
        />
      </mesh>
      <points geometry={geometry} visible={showPoints}>
        <GlyphMaterial size={5} glyphType={GlyphType.Circle} color="black" />
      </points>
    </group>
  );
}

export default SurfaceMesh;
