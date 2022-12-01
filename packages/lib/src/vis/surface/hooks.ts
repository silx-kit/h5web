import type { NumArray } from '@h5web/shared';
import { getDims } from '@h5web/shared';
import type { NdArray } from 'ndarray';
import { useMemo } from 'react';
import { Float32BufferAttribute, Uint8BufferAttribute } from 'three';

export function useBufferAttributes(
  dataArray: NdArray<NumArray>,
  dataToColorScale: (val: number) => [number, number, number]
) {
  const { position, color } = useMemo(() => {
    const { rows, cols } = getDims(dataArray);

    const positions: number[] = [];
    const colors: number[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = dataArray.get(row, col);
        positions.push(col, row, value);
        colors.push(...dataToColorScale(value));
      }
    }

    return {
      position: new Float32BufferAttribute(positions, 3),
      color: new Uint8BufferAttribute(colors, 3, true),
    };
  }, [dataArray, dataToColorScale]);

  const index = useMemo(() => {
    const { rows, cols } = getDims(dataArray);

    const indices: number[] = [];

    function getIndex(col: number, row: number) {
      return row * cols + col;
    }

    for (let row = 0; row < rows - 1; row++) {
      for (let col = 0; col < cols - 1; col++) {
        // Two triangles by point
        indices.push(
          // First triangle: (x,y) -> (x + 1, y) -> (x, y + 1)
          getIndex(col, row),
          getIndex(col + 1, row),
          getIndex(col, row + 1),
          // Second triangle: (x + 1 ,y) -> (x, y + 1) -> (x + 1, y + 1)
          getIndex(col + 1, row),
          getIndex(col, row + 1),
          getIndex(col + 1, row + 1)
        );
      }
    }

    return indices;
  }, [dataArray]);

  return { position, color, index };
}
