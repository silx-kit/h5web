import type { Domain } from '@h5web/shared';
import type { Camera } from '@react-three/fiber';
import { clamp } from 'lodash';
import type { Vector3 } from 'three';
import { Vector2 } from 'three';

import type { Size } from '../vis/models';
import { getWorldFOV } from '../vis/utils';
import type { Interaction, ZoomTransformFn } from './models';

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
  xVisibleDomain: Domain,
  yVisibleDomain: Domain
): [Vector2, Vector2] {
  const ratio = Math.abs(
    (xVisibleDomain[1] - xVisibleDomain[0]) /
      (yVisibleDomain[1] - yVisibleDomain[0])
  );

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

export function getDefaultInteractions(
  keepRatio?: boolean
): Record<string, Interaction> {
  return {
    Pan: {},
    Zoom: {},
    XAxisZoom: { modifierKey: 'Alt', disabled: keepRatio },
    YAxisZoom: { modifierKey: 'Shift', disabled: keepRatio },
    SelectToZoom: { modifierKey: 'Control' },
  };
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

export function getDistinctPoints(
  startPoint: Vector2,
  endPoint: Vector2,
  xDomain: Domain,
  yDomain: Domain
): [Vector2, Vector2] {
  const [xMin, xMax] = xDomain;

  if (Math.abs(endPoint.x - startPoint.x) < Math.abs(xMax - xMin) / 200) {
    return [new Vector2(xMin, startPoint.y), new Vector2(xMax, endPoint.y)];
  }

  const [yMin, yMax] = yDomain;
  if (Math.abs(endPoint.y - startPoint.y) < Math.abs(yMax - yMin) / 200) {
    return [new Vector2(startPoint.x, yMin), new Vector2(endPoint.x, yMax)];
  }

  return [startPoint, endPoint];
}

export function getZoomTransform(
  keepRatio?: boolean,
  fullDimIfEmpty?: boolean
): ZoomTransformFn {
  if (fullDimIfEmpty && keepRatio) {
    return (
      startPt: Vector2,
      endPt: Vector2,
      xDomain: Domain,
      yDomain: Domain
    ) =>
      getRatioRespectingRectangle(
        ...getDistinctPoints(startPt, endPt, xDomain, yDomain),
        xDomain,
        yDomain
      );
  }

  if (fullDimIfEmpty) {
    return getDistinctPoints;
  }

  if (keepRatio) {
    return getRatioRespectingRectangle;
  }

  return (startPoint: Vector2, endPoint: Vector2) => [startPoint, endPoint];
}
