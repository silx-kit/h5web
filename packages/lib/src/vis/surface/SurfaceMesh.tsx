import {
  type Domain,
  type IgnoreValue,
  type NumArray,
} from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';
import { useEffect, useMemo } from 'react';
import { LinearFilter } from 'three';

import HeatmapMaterial from '../heatmap/HeatmapMaterial';
import { useTextureSafeNdArray } from '../heatmap/hooks';
import { type ColorMap } from '../heatmap/models';
import { useUpdateGeometry } from '../hooks';
import { type VisScaleType } from '../models';
import SurfaceMeshGeometry from './surfaceMeshGeometry';

interface Props {
  values: NdArray<NumArray>;
  xCoords: number[];
  yCoords: number[];
  domain: Domain;
  scaleType: VisScaleType;
  colorMap: ColorMap;
  invertColorMap: boolean;
  ignoreValue?: IgnoreValue;
  zHeight: number;
}

function SurfaceMesh(props: Props) {
  const {
    values,
    xCoords,
    yCoords,
    domain,
    scaleType,
    colorMap,
    invertColorMap,
    ignoreValue,
    zHeight,
  } = props;

  const safeValues = useTextureSafeNdArray(values);

  const geometry = useMemo(
    () =>
      new SurfaceMeshGeometry({
        values,
        xCoords,
        yCoords,
        domain,
        scaleType,
        ignoreValue,
      }),
    [values, xCoords, yCoords, domain, scaleType, ignoreValue],
  );

  useUpdateGeometry(geometry);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Geometry height is normalized and stretched by the mesh scale
  return (
    <mesh geometry={geometry} scale={[1, 1, zHeight]}>
      <HeatmapMaterial
        values={safeValues}
        domain={domain}
        scaleType={scaleType}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        magFilter={LinearFilter}
      />
    </mesh>
  );
}

export default SurfaceMesh;
