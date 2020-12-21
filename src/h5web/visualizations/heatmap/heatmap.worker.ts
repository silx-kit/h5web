import { expose, transfer } from 'comlink';
import { rgb } from 'd3-color';
import type { ColorMap } from './models';
import { INTERPOLATORS } from './interpolators';
import type { Domain, ScaleType } from '../shared/models';
import { createAxisScale } from '../shared/utils';
import { scaleSequential } from 'd3-scale';

function computeTextureData(
  values: Float64Array,
  domain: Domain,
  scaleType: ScaleType,
  colorMap: ColorMap
): Uint8Array | undefined {
  const dataScale = createAxisScale({ domain, type: scaleType });

  const colorScale = scaleSequential(INTERPOLATORS[colorMap]);

  // Compute RGB color array for each datapoint `[[<r>, <g>, <b>], [<r>, <g>, <b>], ...]`
  const colors = values.reduce<number[]>((acc, val) => {
    const dataValue = dataScale(val);
    const { r, g, b } = Number.isFinite(dataValue)
      ? rgb(colorScale(dataScale(val)))
      : rgb(255, 255, 255); // `colorScale` returns CSS RGB strings
    acc.push(r, g, b);
    return acc;
  }, []);

  // Transfer colors buffer instead of returning to avoid cloning
  const typedColors = Uint8Array.from(colors);
  return transfer(typedColors, [typedColors.buffer]);
}

export interface TextureWorker {
  computeTextureData: typeof computeTextureData;
}

expose({ computeTextureData });
