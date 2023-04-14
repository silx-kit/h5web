import { getDims, type NumArray } from '@h5web/shared';
import { type NdArray } from 'ndarray';
import { useMemo } from 'react';
import { Float32BufferAttribute } from 'three';

export function useBufferAttributes(dataArray: NdArray<NumArray>) {
  const { position, uv } = useMemo(() => {
    const { rows, cols } = getDims(dataArray);

    const positions: number[] = [];
    const uvs: number[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = dataArray.get(row, col);
        positions.push(col, row, value);
        uvs.push((col + 0.5) / cols, (row + 0.5) / rows);
      }
    }

    return {
      position: new Float32BufferAttribute(positions, 3),
      uv: new Float32BufferAttribute(uvs, 2),
    };
  }, [dataArray]);

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

  return { position, index, uv };
}
