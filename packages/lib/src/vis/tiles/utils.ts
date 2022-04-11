import type { Domain } from '@h5web/shared';
import { Vector2 } from 'three';

import type { Size } from '../models';
import { isDescending } from '../utils';

export function getTileOffsets(
  xDomain: Domain,
  yDomain: Domain,
  tileSize: Size
): Vector2[] {
  const { width, height } = tileSize;

  const [xMin, xMax] = isDescending(xDomain) ? [...xDomain].reverse() : xDomain;
  const [yMin, yMax] = isDescending(yDomain) ? [...yDomain].reverse() : yDomain;

  const nCols = Math.ceil(((xMin % width) + xMax - xMin) / width);
  const nRows = Math.ceil(((yMin % height) + yMax - yMin) / height);

  const start = new Vector2(
    Math.floor(xMin / width) * width,
    Math.floor(yMin / height) * height
  );

  const centers: Vector2[] = [];
  for (let row = 0; row < nRows; row += 1) {
    for (let col = 0; col < nCols; col += 1) {
      centers.push(new Vector2(start.x + col * width, start.y + row * height));
    }
  }

  return centers;
}

// Sort tiles from closest to farthest away from ref
export function sortTilesByDistanceTo(
  offsets: Vector2[],
  tileSize: Size,
  ref: Vector2
) {
  const { width, height } = tileSize;

  offsets.sort((a, b) => {
    const aCenter = new Vector2(a.x + width / 2, a.y + height / 2);
    const bCenter = new Vector2(b.x + width / 2, b.y + height / 2);
    return aCenter.distanceToSquared(ref) - bCenter.distanceToSquared(ref);
  });
}
