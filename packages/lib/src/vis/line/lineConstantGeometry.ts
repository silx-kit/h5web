import { type BufferAttribute, BufferGeometry } from 'three';

import { type H5WebGeometry } from '../models';
import { createBufferAttr, Z_OUT } from '../utils';
import { type LineGeometryParams } from './lineGeometry';

class LineConstantGeometry
  extends BufferGeometry<Record<'position', BufferAttribute>>
  implements H5WebGeometry
{
  public constructor(private readonly params: LineGeometryParams) {
    super();
    const { length } = params.ordinates;
    this.setAttribute('position', createBufferAttr(2 * length - 1));
  }

  public update(): void {
    const { position: positions } = this.attributes;
    const { abscissas, ordinates, abscissaScale, ordinateScale, ignoreValue } =
      this.params;

    for (const [index, value] of ordinates.entries()) {
      const posIndex = 2 * index;

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

      positions.setXYZ(posIndex, x, y, 0);

      if (index >= abscissas.length - 1) {
        positions.setXYZ(posIndex + 1, 0, 0, Z_OUT);
        continue;
      }

      const nextX = abscissaScale(abscissas[index + 1]);
      const nextY = ordinateScale(ordinates[index + 1]);
      if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) {
        positions.setXYZ(posIndex + 1, 0, 0, Z_OUT);
        continue;
      }
      positions.setXYZ(posIndex + 1, nextX, y, 0);
    }
  }
}

export default LineConstantGeometry;
