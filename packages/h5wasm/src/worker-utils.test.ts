import { H5T_CLASS } from '@h5web/shared/h5t';
import { type Dataset as H5WasmDataset, type Metadata } from 'h5wasm';
import { describe, expect, it } from 'vitest';

import { readInSlabs } from './worker-utils';

function meta(fields: Partial<Metadata>): Metadata {
  return fields as unknown as Metadata;
}

// Fake 2D dataset of shape [rows, cols], whose `slice` only supports full rows
function fakeDataset(
  rows: number,
  cols: number,
  type = H5T_CLASS.FLOAT,
  chunks: number[] | null = null,
): H5WasmDataset & { slices: unknown[] } {
  const data = Float32Array.from({ length: rows * cols }, (_, i) => i);
  const slices: unknown[] = [];
  return {
    metadata: meta({ type, size: 4, chunks }),
    slices,
    slice(ranges: [number, number][]) {
      slices.push(ranges);
      const [[start, stop]] = ranges;
      return data.slice(start * cols, stop * cols);
    },
  } as unknown as H5WasmDataset & { slices: unknown[] };
}

describe('readInSlabs', () => {
  it('should read selection in slabs along first dimension', () => {
    const dataset = fakeDataset(10, 4);
    const value = readInSlabs(
      dataset,
      [
        [1, 9],
        [0, 4],
      ],
      3 * 4 * 4, // 3 rows of 4 float32 values
    );

    expect(value).toBeInstanceOf(Float32Array);
    expect(value).toStrictEqual(
      Float32Array.from({ length: 32 }, (_, i) => i + 4),
    );
    expect(dataset.slices).toStrictEqual([
      [
        [1, 4],
        [0, 4],
      ],
      [
        [4, 7],
        [0, 4],
      ],
      [
        [7, 9],
        [0, 4],
      ],
    ]);
  });

  it('should align slabs with chunks', () => {
    const dataset = fakeDataset(10, 4, H5T_CLASS.FLOAT, [2, 4]);
    const value = readInSlabs(
      dataset,
      [
        [1, 9],
        [0, 4],
      ],
      3 * 4 * 4, // 3 rows of 4 float32 values, so 1 chunk of 2 rows
    );

    expect(value).toStrictEqual(
      Float32Array.from({ length: 32 }, (_, i) => i + 4),
    );
    expect(
      dataset.slices.map((ranges) => (ranges as number[][])[0]),
    ).toStrictEqual([
      [1, 2],
      [2, 4],
      [4, 6],
      [6, 8],
      [8, 9],
    ]);
  });

  it('should not read selections that fit in a single slab', () => {
    const dataset = fakeDataset(10, 4);
    expect(
      readInSlabs(
        dataset,
        [
          [0, 3],
          [0, 4],
        ],
        3 * 4 * 4,
      ),
    ).toBeUndefined();
    expect(dataset.slices).toHaveLength(0);
  });

  it('should not read non-numeric datasets', () => {
    const dataset = fakeDataset(10, 4, H5T_CLASS.COMPOUND);
    expect(
      readInSlabs(
        dataset,
        [
          [0, 10],
          [0, 4],
        ],
        4,
      ),
    ).toBeUndefined();
    expect(dataset.slices).toHaveLength(0);
  });
});
