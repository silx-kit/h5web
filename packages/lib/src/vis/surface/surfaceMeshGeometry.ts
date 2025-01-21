/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type NumArray } from '@h5web/shared/vis-models';

import H5WebGeometry from '../shared/h5webGeometry';
import { createBufferAttr, createIndex } from '../utils';

interface Params {
  values: NumArray;
  rows: number;
  cols: number;
}

class SurfaceMeshGeometry extends H5WebGeometry<'position' | 'uv', Params> {
  private skipCount = 0;

  public constructor(public length: number) {
    super();
    this.setAttribute('position', createBufferAttr(length));
    this.setAttribute('uv', createBufferAttr(length, 2));
  }

  public override prepare(params: Params): void {
    super.prepare(params);
    const { rows, cols } = params;

    const positionsToSkip = rows + cols - 1; // skip last col and last row
    const indicesCount = (this.length - positionsToSkip) * 2 * 3; // 2 triangles per position, 3 indices per triangle

    this.index = createIndex(indicesCount, this.length);
    this.skipCount = 0; // to keep track of skipped positions during update
  }

  public update(index: number): void {
    const { values, rows, cols } = this.params!;

    const value = values[index];

    const row = Math.floor(index / cols);
    const col = index % cols;

    this.attributes.position.setXYZ(index, col, row, value);
    this.attributes.uv.setXY(index, (col + 0.5) / cols, (row + 0.5) / rows);

    if (row === rows - 1 || col === cols - 1) {
      this.skipCount++;
      return;
    }

    const bufferIndex = (index - this.skipCount) * 6;

    // First triangle: (x,y) -> (x, y + 1) -> (x + 1, y)
    this.index!.setX(bufferIndex, index);
    this.index!.setX(bufferIndex + 1, index + 1);
    this.index!.setX(bufferIndex + 2, index + cols);

    // Second triangle: (x, y + 1) -> (x + 1 ,y) -> (x + 1, y + 1)
    this.index!.setX(bufferIndex + 3, index + 1);
    this.index!.setX(bufferIndex + 4, index + cols);
    this.index!.setX(bufferIndex + 5, index + cols + 1);
  }
}

export default SurfaceMeshGeometry;
