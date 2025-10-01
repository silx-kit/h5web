import { type BufferAttribute, BufferGeometry } from 'three';

import { type H5WebGeometry } from '../models';
import { createBufferAttr, Z_OUT } from '../utils';
import { type LineGeometryParams } from './lineGeometry';

class GlyphsGeometry
  extends BufferGeometry<Record<'position', BufferAttribute>>
  implements H5WebGeometry
{
  public constructor(private readonly params: LineGeometryParams) {
    super();
    const { length } = params.ordinates;
    this.setAttribute('position', createBufferAttr(length));
  }

  public update(): void {
    const { position: positions } = this.attributes;
    const { abscissas, ordinates, abscissaScale, ordinateScale, ignoreValue } =
      this.params;

    for (const [index, value] of ordinates.entries()) {
      if (ignoreValue?.(value)) {
        positions.setXYZ(index, 0, 0, Z_OUT);
        continue;
      }

      const x = abscissaScale(abscissas[index]);
      const y = ordinateScale(value);

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        positions.setXYZ(index, 0, 0, Z_OUT);
        continue;
      }

      positions.setXYZ(index, x, y, 0);
    }
  }
}

export default GlyphsGeometry;
