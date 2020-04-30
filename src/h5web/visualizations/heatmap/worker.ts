import { expose } from 'comlink';
import { rgb } from 'd3-color';
import { scaleSequential } from 'd3-scale';
import { getDataScale } from './utils';
import { Domain, ColorMap } from './models';
import { INTERPOLATORS } from './interpolators';

function computeTextureData(
  values: number[],
  domain: Domain,
  hasLogScale: boolean,
  colorMap: ColorMap
): Uint8Array | undefined {
  const dataScale = getDataScale(domain, hasLogScale);
  const colorScale = scaleSequential(INTERPOLATORS[colorMap]);

  // Compute RGB color array for each datapoint `[[<r>, <g>, <b>], [<r>, <g>, <b>], ...]`
  const colors = values.map(val => {
    const { r, g, b } = rgb(colorScale(dataScale(val))); // `colorScale` returns CSS RGB strings
    return [r, g, b];
  });

  return Uint8Array.from(colors.flat());
}

export interface TextureWorker {
  computeTextureData: typeof computeTextureData;
}

expose({ computeTextureData });
