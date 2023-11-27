import { ScaleType } from '@h5web/shared/models-vis';
import type { Camera } from '@react-three/fiber';
import type { RefObject } from 'react';
import type { Matrix4, Object3D } from 'three';
import { Box2, Box3, Vector2, Vector3 } from 'three';

import type { Size } from '../models';
import { createScale } from '../utils';

export function getTileOffsets(box: Box2, tileSize: Size): Vector2[] {
  const { width, height } = tileSize;
  const nCols = Math.ceil(
    ((box.min.x % width) + box.max.x - box.min.x) / width,
  );
  const nRows = Math.ceil(
    ((box.min.y % height) + box.max.y - box.min.y) / height,
  );

  const start = new Vector2(
    Math.floor(box.min.x / width) * width,
    Math.floor(box.min.y / height) * height,
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
  ref: Vector2,
) {
  const { width, height } = tileSize;

  offsets.sort((a, b) => {
    const aCenter = new Vector2(a.x + width / 2, a.y + height / 2);
    const bCenter = new Vector2(b.x + width / 2, b.y + height / 2);
    return aCenter.distanceToSquared(ref) - bCenter.distanceToSquared(ref);
  });
}

export function getNdcToObject3DMatrix(
  camera: Camera,
  object3DRef: RefObject<Object3D>,
): Matrix4 | undefined {
  const object3D = object3DRef.current;
  if (!object3D) {
    return undefined;
  }
  // Convert Normalized Device Coordinates -> camera -> world -> local
  return object3D.matrixWorld
    .clone()
    .invert()
    .multiply(camera.matrixWorld)
    .multiply(camera.projectionMatrixInverse);
}

export function getObject3DPixelSize(
  ndcToObject3DMatrix: Matrix4 | undefined,
  canvasSize: Size,
): Vector3 {
  if (!ndcToObject3DMatrix) {
    return new Vector3();
  }
  const ndcPixelBox = new Box3(
    new Vector3(0, 0, 0),
    new Vector3(2 / canvasSize.width, 2 / canvasSize.height, 0),
  );
  const box = ndcPixelBox.applyMatrix4(ndcToObject3DMatrix);
  return box.getSize(new Vector3());
}

const NDC_BOX = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));

export function getObject3DVisibleBox(
  ndcToObject3DMatrix: Matrix4 | undefined,
): Box3 {
  if (!ndcToObject3DMatrix) {
    return new Box3();
  }
  return NDC_BOX.clone().applyMatrix4(ndcToObject3DMatrix);
}

function getLayerScales(layerSize: Size, meshSize: Size) {
  const xScale = createScale(ScaleType.Linear, {
    domain: [-meshSize.width / 2, meshSize.width / 2],
    range: [0, layerSize.width],
    clamp: true,
  });

  const yScale = createScale(ScaleType.Linear, {
    domain: [-meshSize.height / 2, meshSize.height / 2],
    range: [0, layerSize.height],
    clamp: true,
  });

  return { xScale, yScale };
}

export function scaleBoxToLayer(
  box: Box3,
  layerSize: Size,
  meshSize: Size,
): Box2 {
  if (box.isEmpty()) {
    return new Box2();
  }

  const { xScale, yScale } = getLayerScales(layerSize, meshSize);

  const pt1 = new Vector2(xScale(box.min.x), yScale(box.min.y));
  const pt2 = new Vector2(xScale(box.max.x), yScale(box.max.y));

  return new Box2().setFromPoints([pt1, pt2]);
}
