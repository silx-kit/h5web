import type { Camera } from '@react-three/fiber';
import { clamp } from 'lodash';
import { Vector3 } from 'three';

import { getWorldFOV } from '../vis/utils';
import type { ModifierKey } from './models';

export function boundWorldPointToFOV(
  unboundedPoint: Vector3,
  camera: Camera
): Vector3 {
  const { topRight, bottomLeft } = getWorldFOV(camera);
  const boundedX = clamp(unboundedPoint.x, bottomLeft.x, topRight.x);
  const boundedY = clamp(unboundedPoint.y, bottomLeft.y, topRight.y);
  return new Vector3(boundedX, boundedY, 0);
}

export function getModifierKeyArray(
  keys: ModifierKey | ModifierKey[] | undefined = []
): ModifierKey[] {
  return Array.isArray(keys) ? keys : [keys];
}
