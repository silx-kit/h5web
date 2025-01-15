/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type NumArray } from '@h5web/shared/vis-models';

import { type AxisScale } from '../models';
import H5WebGeometry from '../shared/h5webGeometry';
import { createBufferAttr, Z_OUT } from '../utils';

interface Params {
  abscissas: NumArray;
  ordinates: NumArray;
  errors: NumArray;
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
  ignoreValue?: (val: number) => boolean;
}

class ErrorCapsGeometry extends H5WebGeometry<'position', Params> {
  public constructor(length: number) {
    super();
    this.setAttribute('position', createBufferAttr(length * 2));
  }

  public update(index: number): void {
    const {
      abscissas,
      ordinates,
      errors,
      abscissaScale,
      ordinateScale,
      ignoreValue,
    } = this.params!;

    const value = ordinates[index];
    const isIgnored = ignoreValue ? ignoreValue(value) : false;
    const bufferIndex = index * 2;

    if (isIgnored) {
      this.attributes.position.setXYZ(bufferIndex, 0, 0, Z_OUT);
      this.attributes.position.setXYZ(bufferIndex + 1, 0, 0, Z_OUT);
      return;
    }

    const x = abscissaScale(abscissas[index]);
    const y = ordinateScale(value);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      this.attributes.position.setXYZ(bufferIndex, 0, 0, Z_OUT);
      this.attributes.position.setXYZ(bufferIndex + 1, 0, 0, Z_OUT);
      return;
    }

    const error = errors[index];
    const yBottom = ordinateScale(value - error);
    const yTop = ordinateScale(value + error);

    if (Number.isFinite(yBottom)) {
      this.attributes.position.setXYZ(bufferIndex, x, yBottom, 0);
    } else {
      this.attributes.position.setXYZ(bufferIndex, 0, 0, Z_OUT);
    }

    if (Number.isFinite(yTop)) {
      this.attributes.position.setXYZ(bufferIndex + 1, x, yTop, 0);
    } else {
      this.attributes.position.setXYZ(bufferIndex + 1, 0, 0, Z_OUT);
    }
  }
}

export default ErrorCapsGeometry;
