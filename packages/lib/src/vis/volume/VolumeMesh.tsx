import {
  type Domain,
  type NumArray,
  type ScaleType,
} from '@h5web/shared/vis-models';
import { useFrame, useThree } from '@react-three/fiber';
import { type NdArray } from 'ndarray';
import {
  type MutableRefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { BackSide, GLSL3, ShaderMaterial, Vector3 } from 'three';

import { type ColorMap } from '../heatmap/models';
import {
  getColorMapTexture,
  scaleDomain,
  toTextureSafeNdArray,
} from '../heatmap/utils';
import { type VisScaleType } from '../models';
import { getUniforms } from '../utils';
import { type VolumeQuality, type VolumeRenderMode } from './models';
import { getVolumeFragmentShader, VOLUME_VERTEX_SHADER } from './shaders';
import {
  canAllocateVolumeTexture,
  canUseHalfFloats,
  getBoxSize,
  getGLErrors,
  getVolumeTexture,
  SAMPLES_PER_VOXEL,
  toContiguousArray,
  toNormalizedHalfFloats,
  withMemoryCheck,
} from './utils';

interface Props {
  dataArray: NdArray<NumArray>;
  domain: Domain;
  scaleType: VisScaleType;
  colorMap: ColorMap;
  invertColorMap: boolean;
  mode: VolumeRenderMode;
  opacity: number;
  threshold: number;
  quality: VolumeQuality;
  interactingRef: MutableRefObject<boolean>;
}

function VolumeMesh(props: Props) {
  const {
    dataArray,
    domain,
    scaleType: visScaleType,
    colorMap,
    invertColorMap,
    mode,
    opacity,
    threshold,
    quality,
    interactingRef,
  } = props;

  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  // Errors detected outside of render (i.e. on upload) are re-thrown here for error boundaries to catch
  const [gpuError, setGpuError] = useState<Error>();
  if (gpuError) {
    throw gpuError;
  }

  const textureSafeValues = useMemo(
    () =>
      withMemoryCheck(() => toContiguousArray(toTextureSafeNdArray(dataArray))),
    [dataArray],
  );

  const max3DSize = useMemo(() => {
    const ctx = gl.getContext() as WebGL2RenderingContext;
    return ctx.getParameter(ctx.MAX_3D_TEXTURE_SIZE) as number;
  }, [gl]);

  if (textureSafeValues.shape.some((size) => size > max3DSize)) {
    throw new Error(
      `Volume too large for GPU (max ${max3DSize} voxels per dimension)`,
    );
  }

  const { values, valueOffset, valueScale } = useMemo(() => {
    const ctx = gl.getContext() as WebGL2RenderingContext;

    // Fall back to half floats if texture is too large (e.g. Chromium caps textures at 1 GiB)
    if (
      textureSafeValues.dtype === 'float32' &&
      canUseHalfFloats() &&
      !canAllocateVolumeTexture(ctx, textureSafeValues.shape, ctx.R32F)
    ) {
      const normalized = withMemoryCheck(() =>
        toNormalizedHalfFloats(textureSafeValues as NdArray<Float32Array>),
      );
      return {
        values: normalized.values,
        valueOffset: normalized.offset,
        valueScale: normalized.scale,
      };
    }

    return {
      values: textureSafeValues,
      valueOffset: 0,
      // revert WebGL's automatic normalization of UNSIGNED_BYTE with RED format
      valueScale: textureSafeValues.dtype.startsWith('uint8') ? 255 : 1,
    };
  }, [textureSafeValues, gl]);
  const { shape } = values;

  const volumeTexture = useMemo(
    () =>
      getVolumeTexture(
        values,
        values.dtype !== 'float32' ||
          gl.extensions.has('OES_texture_float_linear'),
      ),
    [values, gl],
  );

  const colorMapTexture = useMemo(
    () => getColorMapTexture(colorMap, invertColorMap),
    [colorMap, invertColorMap],
  );

  // Upload volume eagerly to detect out-of-memory errors, which WebGL does not otherwise report
  useLayoutEffect(() => {
    const ctx = gl.getContext();
    getGLErrors(ctx); // clear previous errors
    gl.initTexture(volumeTexture);

    const errors = getGLErrors(ctx);
    if (errors.length > 0) {
      setGpuError(
        new Error(
          errors.includes(ctx.OUT_OF_MEMORY)
            ? 'Not enough GPU memory to render volume'
            : 'Volume too large to be uploaded to the GPU', // e.g. larger than allowed even as half floats
        ),
      );
    }
  }, [gl, volumeTexture]);

  // Some browsers lose the WebGL context instead of reporting OUT_OF_MEMORY
  useEffect(() => {
    const canvas = gl.domElement;
    function handleContextLost() {
      setGpuError(new Error('WebGL context lost (likely out of GPU memory)'));
    }

    canvas.addEventListener('webglcontextlost', handleContextLost);
    return () =>
      canvas.removeEventListener('webglcontextlost', handleContextLost);
  }, [gl]);

  useEffect(() => () => volumeTexture.dispose(), [volumeTexture]);
  useEffect(() => () => colorMapTexture.dispose(), [colorMapTexture]);

  const [scaleType, gammaExponent] = Array.isArray(visScaleType)
    ? visScaleType
    : [visScaleType as ScaleType, 1];

  const material = useMemo(
    () =>
      new ShaderMaterial({
        glslVersion: GLSL3,
        vertexShader: VOLUME_VERTEX_SHADER,
        fragmentShader: getVolumeFragmentShader(mode, scaleType),
        uniforms: getUniforms({
          volume: null,
          colorMap: null,
          dims: new Vector3(),
          domainMin: 0,
          oneOverRange: 1,
          gammaExponent: 1,
          normRevertFactor: 1,
          valueOffset: 0,
          samplesPerVoxel: 1,
          opacity: 1,
          threshold: 0,
        }),
        side: BackSide,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
      }),
    [mode, scaleType],
  );

  useEffect(() => () => material.dispose(), [material]);

  const [min, max] = scaleDomain(domain, scaleType);
  const { uniforms } = material;

  useEffect(() => {
    uniforms.volume.value = volumeTexture;
    uniforms.colorMap.value = colorMapTexture;
    (uniforms.dims.value as Vector3).set(shape[2], shape[1], shape[0]);
    uniforms.domainMin.value = min;
    // Empty domain (or range too small for float32) is flagged with 0 in the shader
    const oneOverRange = Math.fround(1 / (max - min));
    uniforms.oneOverRange.value = Number.isFinite(oneOverRange)
      ? oneOverRange
      : 0;
    uniforms.gammaExponent.value = gammaExponent;
    uniforms.normRevertFactor.value = valueScale;
    uniforms.valueOffset.value = valueOffset;
    uniforms.opacity.value = opacity;
    uniforms.threshold.value = threshold;
    invalidate();
  }, [
    uniforms,
    volumeTexture,
    colorMapTexture,
    shape,
    min,
    max,
    gammaExponent,
    valueScale,
    valueOffset,
    opacity,
    threshold,
    invalidate,
  ]);

  // Lower sampling rate while the camera moves to keep interactions smooth
  useFrame(() => {
    const samples = SAMPLES_PER_VOXEL[quality];
    uniforms.samplesPerVoxel.value = interactingRef.current
      ? samples / 2
      : samples;
  });

  return (
    <mesh scale={getBoxSize(shape)} material={material}>
      <boxGeometry />
    </mesh>
  );
}

export default VolumeMesh;
