import { createArrayFromView } from '@h5web/shared/vis-utils';
import ndarray, { type NdArray } from 'ndarray';
import { Data3DTexture, LinearFilter, NearestFilter, RedFormat } from 'three';

import { type TextureSafeTypedArray } from '../heatmap/models';
import { TEXTURE_TYPES } from '../heatmap/utils';
import { VolumeQuality } from './models';

// Ray-marching samples per voxel (halved while the camera is moving)
export const SAMPLES_PER_VOXEL: Record<VolumeQuality, number> = {
  [VolumeQuality.Low]: 0.5,
  [VolumeQuality.Medium]: 1,
  [VolumeQuality.High]: 2,
};

/**
 * Size of the volume's bounding box, preserving the aspect ratio of the dataset
 * and normalized so that the largest side has a length of 1.
 * Dimensions `[depth, rows, cols]` are mapped to `[z, y, x]`.
 */
export function getBoxSize(shape: number[]): [x: number, y: number, z: number] {
  const [depth, rows, cols] = shape;
  const max = Math.max(depth, rows, cols);
  return [cols / max, rows / max, depth / max];
}

// Textures are uploaded straight from `data`, so views (transposed, sliced, etc.) must be copied first
export function toContiguousArray<T extends TextureSafeTypedArray>(
  arr: NdArray<T>,
): NdArray<T> {
  const [, rows, cols] = arr.shape;
  const isContiguous =
    arr.offset === 0 &&
    arr.data.length === arr.size &&
    arr.stride[0] === rows * cols &&
    arr.stride[1] === cols &&
    arr.stride[2] === 1;

  return isContiguous ? arr : createArrayFromView(arr);
}

export function getVolumeTexture(
  values: NdArray<TextureSafeTypedArray>,
  linear: boolean,
): Data3DTexture {
  const [depth, rows, cols] = values.shape;

  const texture = new Data3DTexture(values.data, cols, rows, depth);
  texture.format = RedFormat;
  texture.type = TEXTURE_TYPES[values.dtype];
  texture.minFilter = linear ? LinearFilter : NearestFilter;
  texture.magFilter = linear ? LinearFilter : NearestFilter;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;

  return texture;
}

export interface NormalizedVolume {
  values: NdArray<Uint16Array>; // half floats
  offset: number;
  scale: number;
}

export function canUseHalfFloats(): boolean {
  return typeof Float16Array !== 'undefined';
}

/**
 * Fallback for volumes too large to upload as 32-bit floats (Chromium caps textures at 1 GiB):
 * store values as half floats, normalized to [0, 1] over the data's bounds so that precision
 * doesn't depend on the magnitude of the values. The original values are recovered in the
 * shader with `value * scale + offset`. NaN and infinite values are preserved.
 */
export function toNormalizedHalfFloats(
  arr: NdArray<Float32Array>,
): NormalizedVolume {
  const { data } = arr;

  // Single pass over finite values (only ever sees `Float32Array`, so faster than `getBounds`)
  let min = Infinity;
  let max = -Infinity;
  // eslint-disable-next-line @typescript-eslint/prefer-for-of, unicorn/no-for-loop -- classic for loop is more efficient
  for (let i = 0; i < data.length; i += 1) {
    const val = data[i];
    // Plain comparisons are several times faster than `Math.min` and `Math.max`
    if (val < min && val !== -Infinity) {
      min = val;
    }
    if (val > max && val !== Infinity) {
      max = val;
    }
  }

  const offset = Number.isFinite(min) ? min : 0;
  const range = Number.isFinite(min) ? max - min : 0;
  const scale = range > 0 ? range : 1;
  const factor = 1 / scale;

  const halfFloats = new Float16Array(data.length);
  // eslint-disable-next-line unicorn/no-for-loop -- classic for loop is more efficient
  for (let i = 0; i < data.length; i += 1) {
    halfFloats[i] = (data[i] - offset) * factor;
  }

  const { buffer, byteOffset, length } = halfFloats;
  return {
    values: ndarray(new Uint16Array(buffer, byteOffset, length), arr.shape),
    offset,
    scale,
  };
}

/* Check whether a volume texture can be allocated, without uploading any data
 * (which, if allocation fails, would otherwise be sent to the GPU in vain). */
export function canAllocateVolumeTexture(
  ctx: WebGL2RenderingContext,
  shape: number[],
  internalFormat: GLenum,
): boolean {
  const [depth, rows, cols] = shape;
  const boundTexture = ctx.getParameter(
    ctx.TEXTURE_BINDING_3D,
  ) as WebGLTexture | null;
  const texture = ctx.createTexture();

  getGLErrors(ctx); // clear previous errors
  ctx.bindTexture(ctx.TEXTURE_3D, texture);
  ctx.texStorage3D(ctx.TEXTURE_3D, 1, internalFormat, cols, rows, depth);
  const canAllocate = getGLErrors(ctx).length === 0;

  ctx.bindTexture(ctx.TEXTURE_3D, boundTexture); // keep three.js' state cache valid
  ctx.deleteTexture(texture);
  return canAllocate;
}

/* Turn failed allocations of large typed arrays into a meaningful error */
export function withMemoryCheck<T>(allocate: () => T): T {
  try {
    return allocate();
  } catch (error) {
    if (error instanceof RangeError) {
      throw new Error('Not enough memory to load volume', { cause: error });
    }
    throw error;
  }
}

/* Drain WebGL error flags, as several may be set at once in no guaranteed order */
export function getGLErrors(
  ctx: WebGLRenderingContext | WebGL2RenderingContext,
): number[] {
  const errors: number[] = [];
  for (let i = 0; i < 16; i += 1) {
    const error = ctx.getError();
    if (error === ctx.NO_ERROR) {
      break;
    }
    errors.push(error);
  }
  return errors;
}
