import React, { useCallback, useRef } from 'react';
import { extent } from 'd3-array';
import { rgb } from 'd3-color';
import { scaleSequential } from 'd3-scale';
import { interpolateMagma } from 'd3-scale-chromatic';
import { OrthographicCamera, Vector3 } from 'three';
import { ReactThreeFiber, PointerEvent } from 'react-three-fiber';

const ZOOM_FACTOR = 0.95;

export function computeTextureData(matrix: number[][]): Uint8Array | undefined {
  const values = matrix.flat();
  const [min, max] = extent(values);

  if (min === undefined || max === undefined) {
    return undefined;
  }

  // Generate D3 color map from domain
  const colorMap = scaleSequential<string>(interpolateMagma);
  colorMap.domain([min, max]);

  // Compute RGB color array for each datapoint `[[<r>, <g>, <b>], [<r>, <g>, <b>], ...]`
  const colors = values.map(val => {
    const { r, g, b } = rgb(colorMap(val)); // `colorMap` returns CSS RGB strings
    return [r, g, b];
  });

  return Uint8Array.from(colors.flat());
}

export function usePanZoom(camera: OrthographicCamera): ReactThreeFiber.Events {
  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders

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
      const { x: pointX, y: pointY } = projectedPoint;
      const { x: startX, y: startY } = startOffsetPosition.current;

      camera.position.set(startX - pointX, startY - pointY, camera.position.z);
    },
    [camera, startOffsetPosition]
  );

  const onWheel = useCallback(
    (evt: PointerEvent) => {
      evt.stopPropagation();

      const { deltaY } = evt as React.WheelEvent;
      const factor = deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

      // eslint-disable-next-line no-param-reassign
      camera.zoom = Math.max(1, camera.zoom * factor);
      camera.updateProjectionMatrix();
    },
    [camera]
  );

  return {
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onWheel,
  };
}
