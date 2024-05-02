/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ColorScaleType, NumArray } from '@h5web/shared/vis-models';
import { rgb } from 'd3-color';

import type { D3Interpolator } from '../heatmap/models';
import type { AxisScale, Scale } from '../models';
import H5WebGeometry from '../shared/h5webGeometry';
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

class ScatterPointsGeometry extends H5WebGeometry<
  'position' | 'color',
  Params
> {
  public constructor(length: number) {
    super();
    this.setAttribute('position', createBufferAttr(length));
    this.setAttribute('color', createBufferAttr(length));
  }

  public update(index: number): void {
    const {
      abscissas,
      ordinates,
      data,
      abscissaScale,
      ordinateScale,
      colorScale,
      interpolator,
    } = this.params!;

    const x = abscissaScale(abscissas[index]);
    const y = ordinateScale(ordinates[index]);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      this.attributes.position.setXYZ(index, 0, 0, Z_OUT);
      this.attributes.color.setXYZ(index, 0, 0, 0);
      return;
    }

    const { r, g, b } = rgb(interpolator(colorScale(data[index])));
    this.attributes.position.setXYZ(index, x, y, 0);
    this.attributes.color.setXYZ(index, r / 255, g / 255, b / 255); // normalize RGB channels
  }
}

export default ScatterPointsGeometry;
