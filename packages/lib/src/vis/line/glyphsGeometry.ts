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

class GlyphsGeometry extends H5WebGeometry<'position', Params> {
  public constructor(length: number) {
    super();
    this.setAttribute('position', createBufferAttr(length));
  }

  public update(index: number): void {
    const { abscissas, ordinates, abscissaScale, ordinateScale, ignoreValue } =
      this.params!;

    const value = ordinates[index];

    if (ignoreValue?.(value)) {
      this.attributes.position.setXYZ(index, 0, 0, Z_OUT);
      return;
    }

    const x = abscissaScale(abscissas[index]);
    const y = ordinateScale(value);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      this.attributes.position.setXYZ(index, 0, 0, Z_OUT);
      return;
    }

    this.attributes.position.setXYZ(index, x, y, 0);
  }
}

export default GlyphsGeometry;
