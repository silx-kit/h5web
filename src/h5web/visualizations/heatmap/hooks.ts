import React, {
  useCallback,
  useRef,
  useEffect,
  CSSProperties,
  useContext,
  useMemo,
} from 'react';
import { Vector3 } from 'three';
import { ReactThreeFiber, PointerEvent, useThree } from 'react-three-fiber';
import { clamp } from 'lodash-es';
import { useMeasure } from 'react-use';
import { scaleSymlog, scaleLinear, scaleSequential } from 'd3-scale';
import { rgb } from 'd3-color';
import shallow from 'zustand/shallow';
import { useHeatmapConfig } from './config';
import { HeatmapProps, HeatmapContext } from './HeatmapProvider';
import { DataScale, D3Interpolator } from './models';
import { INTERPOLATORS } from './interpolators';

const ZOOM_FACTOR = 0.95;

export function useProps(): HeatmapProps {
  const props = useContext(HeatmapContext);

  if (!props) {
    throw new Error('Missing Heatmap provider.');
  }

  return props;
}

export function useValues(): number[] {
  const { data } = useProps();
  return useMemo(() => data.flat(), [data]);
}

export function useInterpolator(): D3Interpolator {
  const colorMap = useHeatmapConfig(state => state.colorMap);
  return INTERPOLATORS[colorMap];
}

export function useDataScale(): DataScale | undefined {
  const [dataDomain, customDomain, hasLogScale] = useHeatmapConfig(
    state => [state.dataDomain, state.customDomain, state.hasLogScale],
    shallow
  );

  return useMemo(() => {
    if (!dataDomain) {
      return undefined;
    }

    const scale = (hasLogScale ? scaleSymlog : scaleLinear)();
    scale.domain(customDomain || dataDomain);

    return scale;
  }, [customDomain, dataDomain, hasLogScale]);
}

export function useTextureData(): Uint8Array | undefined {
  const dataScale = useDataScale();
  const interpolator = useInterpolator();
  const values = useValues();

  return useMemo(() => {
    if (!dataScale) {
      return undefined;
    }

    const colorScale = scaleSequential(interpolator);

    // Compute RGB color array for each datapoint `[[<r>, <g>, <b>], [<r>, <g>, <b>], ...]`
    const colors = values.map(val => {
      const { r, g, b } = rgb(colorScale(dataScale(val))); // `scale` returns CSS RGB strings
      return [r, g, b];
    });

    return Uint8Array.from(colors.flat());
  }, [dataScale, interpolator, values]);
}

export function useHeatmapStyles<T>(): [
  (elem: T) => void,
  CSSProperties | undefined
] {
  const { dims, axisOffsets } = useProps();
  const [leftAxisWidth, bottomAxisHeight] = axisOffsets;

  const keepAspectRatio = useHeatmapConfig(state => state.keepAspectRatio);
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
