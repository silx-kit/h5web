import { type ColorScaleType, type NumArray } from '@h5web/shared/vis-models';
import { rgb } from 'd3-color';
import { type BufferAttribute, BufferGeometry } from 'three';

import { type D3Interpolator } from '../heatmap/models';
import { type AxisScale, type H5WebGeometry, type Scale } from '../models';
import { createBufferAttr, Z_OUT } from '../utils';

interface Params {
  abscissas: NumArray;
  ordinates: NumArray;
  data: NumArray;
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
  colorScale: Scale<ColorScaleType>;
  interpolator: D3Interpolator;
}

class ScatterPointsGeometry
  extends BufferGeometry<Record<'position' | 'color', BufferAttribute>>
  implements H5WebGeometry
{
  public constructor(private readonly params: Params) {
    super();
    const { length } = params.data;
    this.setAttribute('position', createBufferAttr(length));
    this.setAttribute('color', createBufferAttr(length));
  }

  public update(): void {
    const {
      abscissas,
      ordinates,
      data,
      abscissaScale,
      ordinateScale,
      colorScale,
      interpolator,
    } = this.params;

    for (const [index, value] of data.entries()) {
      const x = abscissaScale(abscissas[index]);
      const y = ordinateScale(ordinates[index]);

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        this.attributes.position.setXYZ(index, 0, 0, Z_OUT);
        this.attributes.color.setXYZ(index, 0, 0, 0);
        continue;
      }

      const { r, g, b } = rgb(interpolator(colorScale(value)));
      this.attributes.position.setXYZ(index, x, y, 0);
      this.attributes.color.setXYZ(index, r / 255, g / 255, b / 255); // normalize RGB channels
    }
  }
}

export default ScatterPointsGeometry;
