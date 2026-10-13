import {
  type Domain,
  type IgnoreValue,
  type NumArray,
} from '@h5web/shared/vis-models';
import { useThree } from '@react-three/fiber';
import { type NdArray } from 'ndarray';
import { useEffect, useLayoutEffect, useMemo } from 'react';
import { DoubleSide } from 'three';

import { type ColorMap } from '../heatmap/models';
import { useUpdateGeometry } from '../hooks';
import { type VisScaleType } from '../models';
import SurfaceMeshGeometry from './surfaceMeshGeometry';
import { getLinearColorLut } from './utils';

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

  const invalidate = useThree((state) => state.invalidate);

  const colorLut = useMemo(
    () => getLinearColorLut(colorMap, invertColorMap),
    [colorMap, invertColorMap],
  );

  // Update positions only when data, scale or domain change
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

  // Update colours alone when colour map changes (after positions, before next frame)
  useLayoutEffect(() => {
    geometry.updateColors(colorLut);
    invalidate();
  }, [geometry, colorLut, invalidate]);

  // Geometry height is normalized and stretched by the mesh scale
  return (
    <mesh geometry={geometry} scale={[1, 1, zHeight]}>
      <meshBasicMaterial vertexColors side={DoubleSide} />
    </mesh>
  );
}

export default SurfaceMesh;
