import { type NumArray } from '@h5web/shared/vis-models';
import { type BufferAttribute, BufferGeometry } from 'three';

import { type H5WebGeometry } from '../models';
import { createBufferAttr, Z_OUT } from '../utils';
import { type LineGeometryParams } from './lineGeometry';

interface Params extends LineGeometryParams {
  errors: NumArray;
}

class ErrorBarsGeometry
  extends BufferGeometry<Record<'position', BufferAttribute>>
  implements H5WebGeometry
{
  public constructor(private readonly params: Params) {
    super();
    const { length } = params.ordinates;
    this.setAttribute('position', createBufferAttr(length * 2));
  }

  public update(): void {
    const { position: positions } = this.attributes;
    const {
      abscissas,
      ordinates,
      errors,
      abscissaScale,
      ordinateScale,
      ignoreValue,
    } = this.params;

    for (const [index, value] of ordinates.entries()) {
      const posIndex = index * 2;

      if (ignoreValue?.(value)) {
        positions.setXYZ(posIndex, 0, 0, Z_OUT);
        positions.setXYZ(posIndex + 1, 0, 0, Z_OUT);
        continue;
      }

      const x = abscissaScale(abscissas[index]);
      const y = ordinateScale(value);

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        positions.setXYZ(posIndex, 0, 0, Z_OUT);
        positions.setXYZ(posIndex + 1, 0, 0, Z_OUT);
        continue;
      }

      const error = errors[index];
      const yBottom = ordinateScale(value - error);
      const yTop = ordinateScale(value + error);

      const yBarBottom = Number.isFinite(yBottom) ? yBottom : y;
      const yBarTop = Number.isFinite(yTop) ? yTop : y;

      positions.setXYZ(posIndex, x, yBarBottom, 0);
      positions.setXYZ(posIndex + 1, x, yBarTop, 0);
    }
  }
}

export default ErrorBarsGeometry;
