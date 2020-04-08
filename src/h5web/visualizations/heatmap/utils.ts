import React, { useCallback, useRef } from 'react';
import { extent } from 'd3-array';
import { rgb } from 'd3-color';
import { scaleSequential } from 'd3-scale';
import { interpolateMagma } from 'd3-scale-chromatic';
import { Vector3 } from 'three';
import { ReactThreeFiber, PointerEvent, useThree } from 'react-three-fiber';
import { clamp } from 'lodash-es';

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

export function usePanZoom(): ReactThreeFiber.Events {
  const { size, camera } = useThree();
  const { width, height } = size;

  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders

  const moveCamera = useCallback(
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
    },
    [camera, height, width]
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
      const { x: pointX, y: pointY } = projectedPoint;
      const { x: startX, y: startY } = startOffsetPosition.current;

      moveCamera(startX - pointX, startY - pointY);
    },
    [camera, moveCamera]
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
