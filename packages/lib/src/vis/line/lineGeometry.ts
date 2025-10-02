import { type IgnoreValue, type NumArray } from '@h5web/shared/vis-models';
import {
  type BufferAttribute,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
} from 'three';
import { LineGeometry as ThreeLineGeometry } from 'three/addons/lines/LineGeometry.js';

import { type AxisScale, type H5WebGeometry } from '../models';
import { createBufferAttr, Z_OUT } from '../utils';

interface Params {
  abscissas: NumArray;
  ordinates: NumArray;
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
  ignoreValue?: IgnoreValue;
}

class LineGeometry extends ThreeLineGeometry implements H5WebGeometry {
  private readonly length: number;
  private readonly positions: BufferAttribute;

  public constructor(private readonly params: Params) {
    super();

    this.length = params.ordinates.length;
    this.positions = createBufferAttr((this.length - 1) * 2); // two positions per line segment

    // Parts of `LineGeometry#setPositions` that don't need to be called on every update
    // https://github.com/mrdoob/three.js/blob/40728556ec00833b54be287807cd6fb04a897313/examples/jsm/lines/LineSegmentsGeometry.js#L97
    const { array } = this.positions;
    const instancedBuffer = new InstancedInterleavedBuffer(array, 2 * 3); // two sets of `xyz` coords per line segment
    const startAttr = new InterleavedBufferAttribute(instancedBuffer, 3, 0);
    const endAttr = new InterleavedBufferAttribute(instancedBuffer, 3, 3);
    this.setAttribute('instanceStart', startAttr);
    this.setAttribute('instanceEnd', endAttr);
    this.instanceCount = startAttr.count;
  }

  public update(): void {
    const { abscissas, ordinates, abscissaScale, ordinateScale, ignoreValue } =
      this.params;

    for (const [index, value] of ordinates.entries()) {
      const posIndex = index * 2;

      if (index >= this.length - 1) {
        this.setInvalidSegment(posIndex);
        continue;
      }

      const nextValue = ordinates[index + 1];

      if (ignoreValue?.(value) || ignoreValue?.(nextValue)) {
        this.setInvalidSegment(posIndex);
        continue;
      }

      const x = abscissaScale(abscissas[index]);
      const y = ordinateScale(value);
      const nextX = abscissaScale(abscissas[index + 1]);
      const nextY = ordinateScale(nextValue);

      if (
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        !Number.isFinite(nextX) ||
        !Number.isFinite(nextY)
      ) {
        this.setInvalidSegment(posIndex);
        continue;
      }

      this.positions.setXYZ(posIndex, x, y, 0);
      this.positions.setXYZ(posIndex + 1, nextX, nextY, 0);
    }
  }

  private setInvalidSegment(posIndex: number): void {
    this.positions.setXYZ(posIndex, 0, 0, Z_OUT);
    this.positions.setXYZ(posIndex + 1, 0, 0, Z_OUT);
  }
}

export { type Params as LineGeometryParams };
export default LineGeometry;
