import { rgb } from 'd3-color';
import { scaleSequential } from 'd3-scale';
import { interpolateMagma } from 'd3-scale-chromatic';

function findBounds(values: number[]): [number, number] {
  return values.reduce(
    ([min, max], item) => [Math.min(item, min), Math.max(item, max)],
    [Infinity, -Infinity]
  );
}

export function computeTextureData(matrix: number[][]): Uint8Array {
  const values = matrix.flat();
  const domain: [number, number] = findBounds(values);

  // Generate D3 color map from domain
  const colorMap = scaleSequential<string>(interpolateMagma);
  colorMap.domain(domain);

  // Compute RGB color array for each datapoint `[[<r>, <g>, <b>], [<r>, <g>, <b>], ...]`
  const colors = values.map(val => {
    const { r, g, b } = rgb(colorMap(val)); // `colorMap` returns CSS RGB strings
    return [r, g, b];
  });

  return Uint8Array.from(colors.flat());
}
