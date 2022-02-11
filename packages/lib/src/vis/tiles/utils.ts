import { Vector2 } from 'three';

import type { Size } from '../models';

export function getTileOffsets(
  origin: Vector2,
  end: Vector2,
  tileSize: Size
): Vector2[] {
  const { width, height } = tileSize;

  const nCols = Math.ceil(((origin.x % width) + end.x - origin.x) / width);
  const nRows = Math.ceil(((origin.y % height) + end.y - origin.y) / height);

  const start = new Vector2(
    Math.floor(origin.x / width) * width,
    Math.floor(origin.y / height) * height
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
