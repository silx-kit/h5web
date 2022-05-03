import { ScaleType } from '@h5web/shared';
import type { Camera } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Box2, Box3, Matrix4, Vector2, Vector3 } from 'three';
import type { Object3D } from 'three';

import type { Size } from '../models';
import type { AxisSystemContextValue } from '../shared/AxisSystemProvider';
import { createAxisScale } from '../utils';

export function getTileOffsets(box: Box2, tileSize: Size): Vector2[] {
  const { width, height } = tileSize;
  const nCols = Math.ceil(
    ((box.min.x % width) + box.max.x - box.min.x) / width
  );
  const nRows = Math.ceil(
    ((box.min.y % height) + box.max.y - box.min.y) / height
  );

  const start = new Vector2(
    Math.floor(box.min.x / width) * width,
    Math.floor(box.min.y / height) * height
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

const NDC_BOX = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));

function getObject3DVisibleBox(
  camera: Camera,
  context: AxisSystemContextValue,
  Object3DRef: RefObject<Object3D>
): Box3 | undefined {
  const object3D = Object3DRef.current;
  if (!object3D) {
    return undefined;
  }

  // Convert view box: Normalized Device Coordinates -> camera -> world -> local
  const matrix = new Matrix4()
    .multiplyMatrices(object3D.matrixWorld.invert(), camera.matrixWorld)
    .multiply(camera.projectionMatrixInverse);
  return NDC_BOX.clone().applyMatrix4(matrix);
}

export function getScaledVisibleBox(
  camera: Camera,
  context: AxisSystemContextValue,
  meshSize: Size,
  arraySize: Size,
  ref: RefObject<Object3D>
): Box2 | undefined {
  const box3d = getObject3DVisibleBox(camera, context, ref);
  if (!box3d) {
    return undefined;
  }

  const xScale = createAxisScale(ScaleType.Linear, {
    domain: [-meshSize.width / 2, meshSize.width / 2],
    range: [0, arraySize.width],
    clamp: true,
  });

  const yScale = createAxisScale(ScaleType.Linear, {
    domain: [-meshSize.height / 2, meshSize.height / 2],
    range: [0, arraySize.height],
    clamp: true,
  });

  return new Box2().setFromPoints([
    new Vector2(xScale(box3d.min.x), yScale(box3d.min.y)),
    new Vector2(xScale(box3d.max.x), yScale(box3d.max.y)),
  ]);
}
