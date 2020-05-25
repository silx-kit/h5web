import { expose, transfer } from 'comlink';
import { rgb } from 'd3-color';
import { scaleSequential } from 'd3-scale';
import { ColorMap } from './models';
import { INTERPOLATORS } from './interpolators';
import { Domain } from '../shared/models';
import { getDataScaleFn } from './utils';

function computeTextureData(
  values: Float64Array,
  domain: Domain,
  hasLogScale: boolean,
  colorMap: ColorMap
): Uint8Array | undefined {
  const dataScale = getDataScaleFn(hasLogScale)();
  dataScale.domain(domain);

  const colorScale = scaleSequential(INTERPOLATORS[colorMap]);

  // Compute RGB color array for each datapoint `[[<r>, <g>, <b>], [<r>, <g>, <b>], ...]`
  const colors = values.reduce<number[]>((acc, val) => {
    const { r, g, b } = rgb(colorScale(dataScale(val))); // `colorScale` returns CSS RGB strings
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
