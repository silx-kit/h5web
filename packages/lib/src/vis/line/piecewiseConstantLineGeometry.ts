/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type IgnoreValue, type NumArray } from '@h5web/shared/vis-models';

import { type AxisScale } from '../models';
import H5WebGeometry from '../shared/h5webGeometry';
import { createBufferAttr, Z_OUT } from '../utils';

interface Params {
  abscissas: NumArray;
  ordinates: NumArray;
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
  ignoreValue?: IgnoreValue;
}

class PieceWiseConstantLineGeometry extends H5WebGeometry<'position', Params> {
  public constructor(length: number) {
    super();
    this.setAttribute('position', createBufferAttr(2 * length - 1));
  }

  public update(index: number): void {
    const { abscissas, ordinates, abscissaScale, ordinateScale, ignoreValue } =
      this.params!;

    const value = ordinates[index];

    const posIndex = 2 * index;

    if (ignoreValue?.(value)) {
      this.attributes.position.setXYZ(posIndex, 0, 0, Z_OUT);
      this.attributes.position.setXYZ(posIndex + 1, 0, 0, Z_OUT);
      return;
    }

    const x = abscissaScale(abscissas[index]);
    const y = ordinateScale(value);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      this.attributes.position.setXYZ(posIndex, 0, 0, Z_OUT);
      this.attributes.position.setXYZ(posIndex + 1, 0, 0, Z_OUT);
      return;
    }

    this.attributes.position.setXYZ(posIndex, x, y, 0);

    if (index >= abscissas.length - 1) {
      this.attributes.position.setXYZ(posIndex + 1, 0, 0, Z_OUT);
      return;
    }

    const nextX = abscissaScale(abscissas[index + 1]);
    const nextY = ordinateScale(ordinates[index + 1]);
    if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) {
      this.attributes.position.setXYZ(posIndex + 1, 0, 0, Z_OUT);
      return;
    }
    this.attributes.position.setXYZ(posIndex + 1, nextX, y, 0);
  }
}

export default PieceWiseConstantLineGeometry;
