import type { Camera } from '@react-three/fiber';
import { clamp } from 'lodash';
import type { Vector3 } from 'three';
import { Vector2 } from 'three';

import type { Size } from '../vis/models';
import { getWorldFOV } from '../vis/utils';
import type { ModifierKey } from './models';

export function boundPointToFOV(
  unboundedPoint: Vector2 | Vector3,
  camera: Camera
): Vector2 {
  const { topRight, bottomLeft } = getWorldFOV(camera);
  const boundedX = clamp(unboundedPoint.x, bottomLeft.x, topRight.x);
  const boundedY = clamp(unboundedPoint.y, bottomLeft.y, topRight.y);
  return new Vector2(boundedX, boundedY);
}

export function getRatioRespectingRectangle(
  startPoint: Vector2,
  endPoint: Vector2,
  ratio: number
) {
  const widthSign = Math.sign(endPoint.x - startPoint.x);
  const width = Math.abs(endPoint.x - startPoint.x);

  const heightSign = Math.sign(endPoint.y - startPoint.y);
  const height = Math.abs(endPoint.y - startPoint.y);

  const originalRatio =
    Math.abs(endPoint.x - startPoint.x) / Math.abs(endPoint.y - startPoint.y);

  const shiftX = widthSign * (originalRatio < ratio ? height * ratio : width);
  const shiftY = heightSign * (originalRatio < ratio ? height : width / ratio);

  const centerPoint = endPoint
    .clone()
    .sub(startPoint)
    .divideScalar(2)
    .add(startPoint);

  return [
    new Vector2(centerPoint.x - shiftX / 2, centerPoint.y - shiftY / 2),
    new Vector2(centerPoint.x + shiftX / 2, centerPoint.y + shiftY / 2),
  ];
}

export function getEnclosedRectangle(startPoint: Vector2, endPoint: Vector2) {
  // center = start + (end - start) / 2
  const center = endPoint
    .clone()
    .sub(startPoint)
    .divideScalar(2)
    .add(startPoint);

  return {
    width: Math.abs(endPoint.x - startPoint.x),
    height: Math.abs(endPoint.y - startPoint.y),
    center,
  };
}

export function clampPositionToArea(
  center: Vector2,
  rectSize: Size,
  areaSize: Size
): Vector2 {
  const xBound = Math.max(areaSize.width / 2 - rectSize.width / 2, 0);
  const yBound = Math.max(areaSize.height / 2 - rectSize.height / 2, 0);

  return new Vector2(
    clamp(center.x, -xBound, xBound),
    clamp(center.y, -yBound, yBound)
  );
}

export function clampRectangleToVis(
  startPoint: Vector2,
  endPoint: Vector2,
  visSize: Size
): [Vector2, Vector2] {
  const { center, ...rectSize } = getEnclosedRectangle(startPoint, endPoint);

  const newCenter = clampPositionToArea(center, rectSize, visSize);

  const shift = newCenter.clone().sub(center);
  return [startPoint.clone().add(shift), endPoint.clone().add(shift)];
}

export function getModifierKeyArray(
  keys: ModifierKey | ModifierKey[] | undefined = []
): ModifierKey[] {
  return Array.isArray(keys) ? keys : [keys];
}
