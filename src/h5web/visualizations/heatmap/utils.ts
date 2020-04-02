import { extent } from 'd3-array';
import { rgb } from 'd3-color';
import { scaleSequential } from 'd3-scale';
import { interpolateMagma } from 'd3-scale-chromatic';

export function computeTextureData(matrix: number[][]): Uint8Array | undefined {
  const values = matrix.flat();
  const [min, max] = extent(values);

  if (min === undefined || max === undefined) {
    return undefined;
  }

  // Generate D3 color map from domain
  const colorMap = scaleSequential<string>(interpolateMagma);
  colorMap.domain([min, max]);

  // Compute RGB color array for each datapoint `[[<r>, <g>, <b>], [<r>, <g>, <b>], ...]`
  const colors = values.map(val => {
    const { r, g, b } = rgb(colorMap(val)); // `colorMap` returns CSS RGB strings
    return [r, g, b];
  });

  return Uint8Array.from(colors.flat());
}
