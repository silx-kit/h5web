import { assertNonNull } from '@h5web/shared/guards';
import {
  type Domain,
  type IgnoreValue,
  type NumArray,
} from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';
import { type BufferAttribute, BufferGeometry } from 'three';

import { type H5WebGeometry, type VisScaleType } from '../models';
import {
  createBufferAttr,
  createIndex,
  createScale,
  SCALES_VALID_MINS,
} from '../utils';

interface Params {
  values: NdArray<NumArray>;
  xCoords: number[]; // world x of each column
  yCoords: number[]; // world y of each row
  domain: Domain;
  scaleType: VisScaleType;
  ignoreValue?: IgnoreValue;
}

class SurfaceMeshGeometry
  extends BufferGeometry<Record<'position' | 'color', BufferAttribute>>
  implements H5WebGeometry
{
  private readonly valid: Uint8Array;

  public constructor(private readonly params: Params) {
    super();

    const { values } = params;
    const { size } = values;
    const [rows, cols] = values.shape;

    this.setAttribute('position', createBufferAttr(size));
    this.setAttribute('color', createBufferAttr(size));

    const indicesCount = (rows - 1) * (cols - 1) * 2 * 3; // 2 triangles per cell, 3 indices per triangle
    this.index = createIndex(indicesCount, size);
    this.valid = new Uint8Array(size);
  }

  /**
   * Height is normalized to [0, 1] with the same scale and domain as the colour,
   * so height and colour always tell the same story.
   * Cells touching a NaN, an ignored value or a value that is not supported
   * by the scale (e.g. negative values in log) are left out: they appear as holes.
   */
  public update(): void {
    const { values, xCoords, yCoords, domain, scaleType, ignoreValue } =
      this.params;
    const [rows, cols] = values.shape;
    assertNonNull(this.index);

    const scale = createScale(scaleType, {
      domain,
      range: [0, 1],
      clamp: true,
    });
    const validMin =
      SCALES_VALID_MINS[Array.isArray(scaleType) ? scaleType[0] : scaleType];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const index = row * cols + col;
        const value = values.get(row, col); // `values` may be a view
        const x = xCoords[col];
        const y = yCoords[row];
        const z = scale(value);

        // Keep positions of unused vertices finite, so bounds stay valid
        const isValidXY = Number.isFinite(x) && Number.isFinite(y);
        const isValid =
          isValidXY &&
          Number.isFinite(value) &&
          value >= validMin &&
          !ignoreValue?.(value) &&
          Number.isFinite(z);

        this.attributes.position.setXYZ(
          index,
          isValidXY ? x : 0,
          isValidXY ? y : 0,
          isValid ? z : 0,
        );
        this.valid[index] = isValid ? 1 : 0;
      }
    }

    let posIndex = 0;
    for (let row = 0; row < rows - 1; row += 1) {
      for (let col = 0; col < cols - 1; col += 1) {
        const index = row * cols + col;
        const corners = [index, index + 1, index + cols, index + cols + 1];
        if (!corners.every((i) => this.valid[i])) {
          continue;
        }

        // First triangle: (x,y) -> (x + 1, y) -> (x, y + 1)
        this.index.setX(posIndex, index);
        this.index.setX(posIndex + 1, index + 1);
        this.index.setX(posIndex + 2, index + cols);

        // Second triangle: (x + 1, y) -> (x + 1, y + 1) -> (x, y + 1)
        this.index.setX(posIndex + 3, index + 1);
        this.index.setX(posIndex + 4, index + cols + 1);
        this.index.setX(posIndex + 5, index + cols);

        posIndex += 6;
      }
    }

    // Unused indices are not drawn
    this.index.array.fill(0, posIndex);
    this.setDrawRange(0, posIndex);

    this.computeBoundingSphere();
  }

  /**
   * Vertex colours (linear RGB) from normalized heights: since height and colour share
   * the same scale and domain, colours can be updated without updating positions.
   */
  public updateColors(colorLut: Float32Array): void {
    const { position, color } = this.attributes;
    const lutMax = colorLut.length / 3 - 1;

    for (let i = 0; i < position.count; i += 1) {
      const lutIndex = Math.round(position.getZ(i) * lutMax) * 3;
      color.setXYZ(
        i,
        colorLut[lutIndex],
        colorLut[lutIndex + 1],
        colorLut[lutIndex + 2],
      );
    }

    color.needsUpdate = true;
  }
}

export default SurfaceMeshGeometry;
