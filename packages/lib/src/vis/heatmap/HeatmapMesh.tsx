import { type Domain } from '@h5web/shared/vis-models';
import { type GroupProps, useThree } from '@react-three/fiber';
import { type RGBColor } from 'd3-color';
import { type NdArray } from 'ndarray';
import { useEffect, useMemo } from 'react';
import {
  type MagnificationTextureFilter,
  type MinificationTextureFilter,
} from 'three';

import { type VisScaleType } from '../models';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import VisMesh, { type VisMeshProps } from '../shared/VisMesh';
import HeatmapMaterial from './HeatmapMaterial';
import { type ColorMap, type TextureSafeTypedArray } from './models';
import {
  getChunkBounds,
  getChunkGeometry,
  getTextureChunks,
  sliceTextureChunk,
} from './utils';

interface Props extends VisMeshProps {
  values: NdArray<TextureSafeTypedArray>;
  domain: Domain;
  scaleType: VisScaleType;
  colorMap: ColorMap;
  invertColorMap?: boolean;
  alphaValues?: NdArray<TextureSafeTypedArray>;
  alphaDomain?: Domain;
  badColor?: RGBColor | string;
  magFilter?: MagnificationTextureFilter;
  minFilter?: MinificationTextureFilter;
  mask?: NdArray<Uint8Array>;
}

function HeatmapMesh(props: Props) {
  const {
    values,
    domain,
    scaleType,
    colorMap,
    invertColorMap,
    alphaValues,
    alphaDomain,
    badColor,
    magFilter,
    minFilter,
    mask,
    size,
    ...meshProps
  } = props;

  const { visSize } = useVisCanvasContext();
  const maxTextureSize = useThree(
    (state) => state.gl.capabilities.maxTextureSize,
  );

  // Split arrays that exceed the GPU's max texture size into multiple textures/meshes
  const [rows, cols] = values.shape;
  const chunks = useMemo(
    () =>
      rows > maxTextureSize || cols > maxTextureSize
        ? getTextureChunks([rows, cols], maxTextureSize)
        : undefined,
    [rows, cols, maxTextureSize],
  );

  const valuesChunks = useMemo(
    () => chunks?.map((chunk) => sliceTextureChunk(values, chunk)),
    [values, chunks],
  );
  const alphaChunks = useMemo(
    () => alphaValues && chunks?.map((c) => sliceTextureChunk(alphaValues, c)),
    [alphaValues, chunks],
  );
  const maskChunks = useMemo(
    () => mask && chunks?.map((chunk) => sliceTextureChunk(mask, chunk)),
    [mask, chunks],
  );

  const { width, height } = size ?? visSize;
  const geometries = useMemo(
    () =>
      chunks?.map((chunk) =>
        getChunkGeometry(
          getChunkBounds(chunk, [rows, cols], { width, height }),
        ),
      ),
    [chunks, rows, cols, width, height],
  );

  useEffect(
    () => () => {
      geometries?.forEach((geometry) => {
        geometry.dispose();
      });
    },
    [geometries],
  );

  const materialProps = {
    domain,
    scaleType,
    colorMap,
    invertColorMap,
    alphaDomain,
    badColor,
    magFilter,
    minFilter,
  };

  if (!chunks || !geometries || !valuesChunks) {
    return (
      <VisMesh size={size} {...meshProps}>
        <HeatmapMaterial
          values={values}
          alphaValues={alphaValues}
          mask={mask}
          {...materialProps}
        />
      </VisMesh>
    );
  }

  return (
    <group {...(meshProps as GroupProps)}>
      {chunks.map(({ rows: r, cols: c }, i) => (
        <mesh key={`${r.start},${c.start}`} geometry={geometries[i]}>
          <HeatmapMaterial
            values={valuesChunks[i]}
            alphaValues={alphaChunks?.[i]}
            mask={maskChunks?.[i]}
            {...materialProps}
          />
        </mesh>
      ))}
    </group>
  );
}

export type { Props as HeatmapMeshProps };
export default HeatmapMesh;
