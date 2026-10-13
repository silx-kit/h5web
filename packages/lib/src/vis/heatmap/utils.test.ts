import { ScaleType } from '@h5web/shared/vis-models';
import { interpolateGreys } from 'd3-scale-chromatic';
import ndarray from 'ndarray';
import { describe, expect, it } from 'vitest';

import { DomainError } from '../models';
import {
  getChunkBounds,
  getLinearGradient,
  getSafeDomain,
  getTextureChunks,
  sliceTextureChunk,
  toTextureSafeNdArray,
} from './utils';

const white = 'rgb(255, 255, 255)';
const black = 'rgb(0, 0, 0)';
const gradientRegex = /^linear-gradient\(to top, (.+)\)$/;

describe('getSafeDomain', () => {
  it('should return given domain if safe in given scale', () => {
    const [domain, errors] = getSafeDomain([-10, 5], [1, 2], ScaleType.Linear);
    expect(domain).toEqual([-10, 5]);
    expect(errors).toEqual({});
  });

  it('should return fallback domain if min > max', () => {
    const [domain, errors] = getSafeDomain([5, -10], [1, 2], ScaleType.Linear);
    expect(domain).toEqual([1, 2]);
    expect(errors).toEqual({ minGreater: true });
  });

  it('should use fallback min if not supported by given scale', () => {
    const logResult = getSafeDomain([0, 5], [1, 2], ScaleType.Log);
    const sqrtResult = getSafeDomain([-1, 5], [1, 2], ScaleType.Sqrt);

    const expectedDomain = [1, 5];
    const expectedErrors = { minError: DomainError.InvalidMinWithScale };

    expect(logResult).toEqual([expectedDomain, expectedErrors]);
    expect(sqrtResult).toEqual([expectedDomain, expectedErrors]);
  });

  it('should return fallback domain if neither min nor max are supported by given scale', () => {
    const logResult = getSafeDomain([-2, 0], [1, 2], ScaleType.Log);
    const sqrtResult = getSafeDomain([-10, -5], [1, 2], ScaleType.Sqrt);

    const expectedDomain = [1, 2];
    const expectedErrors = {
      minError: DomainError.InvalidMinWithScale,
      maxError: DomainError.InvalidMaxWithScale,
    };

    expect(logResult).toEqual([expectedDomain, expectedErrors]);
    expect(sqrtResult).toEqual([expectedDomain, expectedErrors]);
  });

  it('should return empty [max, max] domain if fallback min is greater than max', () => {
    const [domain, errors] = getSafeDomain([-5, 5], [10, 20], ScaleType.Log);
    expect(domain).toEqual([5, 5]);
    expect(errors).toEqual({ minError: DomainError.CustomMaxFallback });
  });
});

describe('getLinearGradient', () => {
  it('should generate linear gradient from first to last color', () => {
    const gradient = getLinearGradient(interpolateGreys, 'top');

    const [match, colorStops] = gradientRegex.exec(gradient) || [];
    expect(match).toBeDefined();
    expect(colorStops.startsWith(white)).toBe(true);
    expect(colorStops.endsWith(black)).toBe(true);
    expect(colorStops.match(/rgb/gu)?.length).toBe(21);
  });

  it('should generate linear gradient with two solid colors', () => {
    const gradient = getLinearGradient(interpolateGreys, 'top', true);

    const [match, colorStops] = gradientRegex.exec(gradient) || [];
    expect(match).toBeDefined();
    expect(colorStops).toBe(`${white}, ${white} 50%, ${black} 50%, ${black}`);
  });
});

describe('toTextureSafeNdArray', () => {
  it('should pass float32 and uint8 through', () => {
    const initial = ndarray(Float32Array.from([1, 2]), [2]);
    expect(toTextureSafeNdArray(initial)).toBe(initial);
  });

  it('should pass float16 through as uint16 without copying', () => {
    const values = Float16Array.from([1.5, -2.5]);
    const safe = toTextureSafeNdArray(ndarray(values, [2]));

    expect(safe.dtype).toBe('uint16');
    expect(safe.data.buffer).toBe(values.buffer);
    expect(safe.shape).toEqual([2]);
  });

  it('should convert other numeric types to float32', () => {
    const safe = toTextureSafeNdArray(ndarray(Int16Array.from([1, 2]), [2]));

    expect(safe.dtype).toBe('float32');
    expect([...safe.data]).toEqual([1, 2]);
  });
});

describe('getTextureChunks', () => {
  it('should return single chunk if shape fits in max texture size', () => {
    expect(getTextureChunks([4, 3], 4)).toEqual([
      {
        rows: { start: 0, end: 4, texStart: 0, texEnd: 4 },
        cols: { start: 0, end: 3, texStart: 0, texEnd: 3 },
      },
    ]);
  });

  it('should split rows into chunks with overlapping texels', () => {
    // Chunks hold at most 4 - 2 visible rows so textures with overlap fit in 4
    expect(getTextureChunks([5, 3], 4)).toEqual([
      {
        rows: { start: 0, end: 2, texStart: 0, texEnd: 3 },
        cols: { start: 0, end: 3, texStart: 0, texEnd: 3 },
      },
      {
        rows: { start: 2, end: 4, texStart: 1, texEnd: 5 },
        cols: { start: 0, end: 3, texStart: 0, texEnd: 3 },
      },
      {
        rows: { start: 4, end: 5, texStart: 3, texEnd: 5 },
        cols: { start: 0, end: 3, texStart: 0, texEnd: 3 },
      },
    ]);
  });

  it('should split both dimensions', () => {
    const chunks = getTextureChunks([10, 7], 6);

    expect(chunks.map(({ rows, cols }) => [rows.start, cols.start])).toEqual([
      [0, 0],
      [0, 4],
      [4, 0],
      [4, 4],
      [8, 0],
      [8, 4],
    ]);
    expect(chunks[3]).toEqual({
      rows: { start: 4, end: 8, texStart: 3, texEnd: 9 },
      cols: { start: 4, end: 7, texStart: 3, texEnd: 7 },
    });

    chunks.forEach(({ rows, cols }) => {
      expect(rows.texEnd - rows.texStart).toBeLessThanOrEqual(6);
      expect(cols.texEnd - cols.texStart).toBeLessThanOrEqual(6);
    });
  });
});

describe('sliceTextureChunk', () => {
  const chunk = {
    rows: { start: 1, end: 2, texStart: 0, texEnd: 3 },
    cols: { start: 2, end: 3, texStart: 1, texEnd: 4 },
  };

  it('should copy chunk with overlapping texels into new array of same type', () => {
    const values = ndarray(
      Uint8Array.from({ length: 12 }, (_, i) => i),
      [3, 4],
    );
    const sliced = sliceTextureChunk(values, chunk);

    expect(sliced.dtype).toBe('uint8');
    expect(sliced.shape).toEqual([3, 3]);
    expect([...sliced.data]).toEqual([1, 2, 3, 5, 6, 7, 9, 10, 11]);
  });

  it('should respect strides and offset of views', () => {
    const data = Float32Array.from({ length: 12 }, (_, i) => i);
    const transposed = ndarray(data, [4, 3]).transpose(1, 0); // shape [3, 4]
    const sliced = sliceTextureChunk(transposed, chunk);

    expect([...sliced.data]).toEqual([3, 6, 9, 4, 7, 10, 5, 8, 11]);
  });

  it('should not copy contiguous rows', () => {
    const values = ndarray(
      Float32Array.from({ length: 12 }, (_, i) => i),
      [4, 3],
    );
    const sliced = sliceTextureChunk(values, {
      rows: { start: 2, end: 3, texStart: 1, texEnd: 4 },
      cols: { start: 0, end: 3, texStart: 0, texEnd: 3 },
    });

    expect(sliced.data.buffer).toBe(values.data.buffer);
    expect([...sliced.data]).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});

describe('getChunkBounds', () => {
  it('should compute quad and visible texture coordinates of chunk', () => {
    const [, chunk] = getTextureChunks([5, 3], 4);
    const bounds = getChunkBounds(chunk, [5, 3], { width: 30, height: 10 });

    expect(bounds).toEqual({
      x: [-15, 15],
      y: [-1, 3],
      u: [0, 1],
      v: [0.25, 0.75], // visible rows 2-3 within texture rows 1-4
    });
  });

  it('should share exact edges between adjacent chunks', () => {
    const shape = [10, 7];
    const size = { width: 1, height: 0.3 }; // non-integer cell sizes
    const chunks = getTextureChunks(shape, 6);
    const [b00, b01, b10] = [0, 1, 2].map((i) =>
      getChunkBounds(chunks[i], shape, size),
    );

    expect(b00.x[1]).toBe(b01.x[0]);
    expect(b00.y[1]).toBe(b10.y[0]);
    expect(b00.x[0]).toBe(-0.5);
    expect(b00.y[0]).toBe(-0.15);
  });
});
