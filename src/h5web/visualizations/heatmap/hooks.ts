import React, { useCallback, useRef, useEffect, CSSProperties } from 'react';
import { Vector3 } from 'three';
import { ReactThreeFiber, PointerEvent, useThree } from 'react-three-fiber';
import { clamp } from 'lodash-es';
import { useMeasure } from 'react-use';
import { useHeatmapStore } from './store';

const ZOOM_FACTOR = 0.95;

export function useHeatmapStyles<T>(
  dims: [number, number],
  axisOffset: [number, number]
): [(elem: T) => void, CSSProperties | undefined] {
  const [leftAxisWidth, bottomAxisHeight] = axisOffset;

  const keepAspectRatio = useHeatmapStore(state => state.keepAspectRatio);
  const [wrapperRef, { width, height }] = useMeasure();

  if (width === 0 && height === 0) {
    return [wrapperRef, undefined];
  }

  if (!keepAspectRatio) {
    return [
      wrapperRef,
      {
        width,
        height,
        paddingBottom: bottomAxisHeight,
        paddingLeft: leftAxisWidth,
      },
    ];
  }

  const [rows, cols] = dims;
  const aspectRatio = rows / cols;

  const availableWidth = width - leftAxisWidth;
  const availableHeight = height - bottomAxisHeight;

  // Determine how to compute canvas size to fit available space while maintaining aspect ratio
  const shouldAdjustWidth = availableWidth >= availableHeight * aspectRatio;

  const canvasWidth = shouldAdjustWidth
    ? availableHeight * aspectRatio
    : availableWidth;
  const canvasHeight = shouldAdjustWidth
    ? availableHeight
    : availableWidth / aspectRatio;

  return [
    wrapperRef,
    {
      boxSizing: 'content-box',
      width: canvasWidth,
      height: canvasHeight,
      paddingBottom: bottomAxisHeight,
      paddingLeft: leftAxisWidth,
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
      const { currentTarget, pointerId } = evt as React.PointerEvent;
      currentTarget.setPointerCapture(pointerId);

      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());
      startOffsetPosition.current = camera.position.clone().add(projectedPoint);
    },
    [camera]
  );

  const onPointerUp = useCallback((evt: PointerEvent) => {
    const { currentTarget, pointerId } = evt as React.PointerEvent;
    currentTarget.releasePointerCapture(pointerId);

    startOffsetPosition.current = undefined;
  }, []);

  const onPointerMove = useCallback(
    (evt: PointerEvent) => {
      if (!startOffsetPosition.current) {
        return;
      }

      // Prevent events from reaching tooltip mesh when panning
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
