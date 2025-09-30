import { assertNonNull } from '@h5web/shared/guards';
import { type NumArray } from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';
import { type BufferAttribute, BufferGeometry } from 'three';

import { type H5WebGeometry } from '../models';
import { createBufferAttr, createIndex } from '../utils';

interface Params {
  dataArray: NdArray<NumArray>;
  rows: number;
  cols: number;
}

class SurfaceMeshGeometry
  extends BufferGeometry<Record<'position' | 'uv', BufferAttribute>>
  implements H5WebGeometry
{
  private skipCount = 0;

  public constructor(private readonly params: Params) {
    super();

    const { dataArray, rows, cols } = params;
    const { size } = dataArray;

    this.setAttribute('position', createBufferAttr(size));
    this.setAttribute('uv', createBufferAttr(size, 2));

    const positionsToSkip = rows + cols - 1; // skip last col and last row
    const indicesCount = (size - positionsToSkip) * 2 * 3; // 2 triangles per position, 3 indices per triangle

    this.index = createIndex(indicesCount, size);
    this.skipCount = 0; // to keep track of skipped positions during update
  }

  public update(): void {
    const { dataArray, rows, cols } = this.params;
    assertNonNull(this.index);

    for (const [index, value] of dataArray.data.entries()) {
      const row = Math.floor(index / cols);
      const col = index % cols;

      this.attributes.position.setXYZ(index, col, row, value);
      this.attributes.uv.setXY(index, (col + 0.5) / cols, (row + 0.5) / rows);

      if (row === rows - 1 || col === cols - 1) {
        this.skipCount++;
        continue;
      }

      const posIndex = (index - this.skipCount) * 6;

      // First triangle: (x,y) -> (x, y + 1) -> (x + 1, y)
      this.index.setX(posIndex, index);
      this.index.setX(posIndex + 1, index + 1);
      this.index.setX(posIndex + 2, index + cols);

      // Second triangle: (x, y + 1) -> (x + 1 ,y) -> (x + 1, y + 1)
      this.index.setX(posIndex + 3, index + 1);
      this.index.setX(posIndex + 4, index + cols);
      this.index.setX(posIndex + 5, index + cols + 1);
    }
  }
}

export default SurfaceMeshGeometry;
