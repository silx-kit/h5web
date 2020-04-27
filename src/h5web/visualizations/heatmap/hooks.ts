import React, { useCallback, useRef, useEffect } from 'react';
import { Vector3 } from 'three';
import { ReactThreeFiber, PointerEvent, useThree } from 'react-three-fiber';
import { clamp } from 'lodash-es';
import { useMeasure } from 'react-use';
import { useHeatmapStore } from './store';

const ZOOM_FACTOR = 0.95;

export function useHeatmapSize<T>(
  dims: [number, number],
  axisOffset: [number, number]
): [(elem: T) => void, { width: number; height: number } | undefined] {
  const keepAspectRatio = useHeatmapStore(state => state.keepAspectRatio);
  const [wrapperRef, { width, height }] = useMeasure();

  if (width === 0 && height === 0) {
    return [wrapperRef, undefined];
  }

  if (!keepAspectRatio) {
    return [wrapperRef, { width, height }];
  }

  const [rows, cols] = dims;
  const aspectRatio = rows / cols;

  const [leftAxisWidth, bottomAxisHeight] = axisOffset;
  const availableWidth = width - leftAxisWidth;
  const availableHeight = height - bottomAxisHeight;

  // Determine how to compute mesh size to fit available space while maintaining aspect ratio
  const shouldAdjustWidth = availableWidth >= availableHeight * aspectRatio;

  const meshWidth = shouldAdjustWidth
    ? availableHeight * aspectRatio
    : availableWidth;
  const meshHeight = shouldAdjustWidth
    ? availableHeight
    : availableWidth / aspectRatio;

  return [
    wrapperRef,
    {
      width: meshWidth + leftAxisWidth,
      height: meshHeight + bottomAxisHeight,
    },
  ];
}

export function usePanZoom(): ReactThreeFiber.Events {
  const { camera, invalidate, size } = useThree();
  const { width, height } = size;

  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders

  const moveCameraTo = useCallback(
    (x: number, y: number) => {
      const { position, zoom } = camera;

      const factor = (1 - 1 / zoom) / 2;
      const xBound = width * factor;
      const yBound = height * factor;

      position.set(
        clamp(x, -xBound, xBound),
        clamp(y, -yBound, yBound),
        position.z
      );

      invalidate();
    },
    [camera, height, invalidate, width]
  );

  const onPointerDown = useCallback(
    (evt: PointerEvent) => {
      evt.stopPropagation();

      const { currentTarget, pointerId } = evt as React.PointerEvent;
      currentTarget.setPointerCapture(pointerId);

      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());
      startOffsetPosition.current = camera.position.clone().add(projectedPoint);
    },
    [camera]
  );

  const onPointerUp = useCallback((evt: PointerEvent) => {
    evt.stopPropagation();

    const { currentTarget, pointerId } = evt as React.PointerEvent;
    currentTarget.releasePointerCapture(pointerId);

    startOffsetPosition.current = undefined;
  }, []);

  const onPointerMove = useCallback(
    (evt: PointerEvent) => {
      if (!startOffsetPosition.current) {
        return;
      }

      evt.stopPropagation();

      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());
      const { x: pointerX, y: pointerY } = projectedPoint;
      const { x: startX, y: startY } = startOffsetPosition.current;

      moveCameraTo(startX - pointerX, startY - pointerY);
    },
    [camera, moveCameraTo]
  );

  const onWheel = useCallback(
    (evt: PointerEvent) => {
      evt.stopPropagation();

      const { deltaY } = evt as React.WheelEvent;
      const factor = deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

      // eslint-disable-next-line no-param-reassign
      camera.zoom = Math.max(1, camera.zoom * factor);
      camera.updateProjectionMatrix();

      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());
      const { x: pointerX, y: pointerY } = projectedPoint;
      const { x: camX, y: camY } = camera.position;

      moveCameraTo(
        camX + pointerX * (1 - 1 / factor),
        camY + pointerY * (1 - 1 / factor)
      );
    },
    [camera, moveCameraTo]
  );

  useEffect(() => {
    // Move camera on resize to stay within mesh bounds
    moveCameraTo(camera.position.x, camera.position.y);
  }, [camera, moveCameraTo]);

  return {
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onWheel,
  };
}
