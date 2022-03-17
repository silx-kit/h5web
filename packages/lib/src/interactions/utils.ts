import type { Camera } from '@react-three/fiber';
import { clamp } from 'lodash';
import type { Vector3 } from 'three';
import { Vector2 } from 'three';

import { getCameraFOV } from '../vis/utils';
import type { ModifierKey } from './models';

export function boundPointToFOV(
  unboundedPoint: Vector2 | Vector3,
  camera: Camera
): Vector2 {
  const { topRight, bottomLeft } = getCameraFOV(camera);
  const boundedX = clamp(unboundedPoint.x, bottomLeft.x, topRight.x);
  const boundedY = clamp(unboundedPoint.y, bottomLeft.y, topRight.y);
  return new Vector2(boundedX, boundedY);
}

export function checkModifierKey(
  modifierKey: ModifierKey | undefined,
  event: MouseEvent | KeyboardEvent
) {
  if (!modifierKey) {
    return !event.altKey && !event.ctrlKey && !event.shiftKey;
  }

  return event.getModifierState(modifierKey);
}

export function getRatioEndPoint(
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

  if (originalRatio < ratio) {
    return new Vector2(
      startPoint.x + widthSign * height * ratio,
      startPoint.y + heightSign * height
    );
  }

  return new Vector2(
    startPoint.x + widthSign * width,
    startPoint.y + (heightSign * width) / ratio
  );
}
