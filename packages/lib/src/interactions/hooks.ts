import { useEventListener } from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import { clamp } from 'lodash';
import { useCallback, useEffect } from 'react';
import { Vector3 } from 'three';

import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import { getCameraFOV } from '../vis/utils';
import type { CanvasEvent, CanvasEventCallbacks, Interaction } from './models';

const ZOOM_FACTOR = 0.95;

const ONE_VECTOR = new Vector3(1, 1, 1);

export function useMoveCameraTo() {
  const { visSize } = useAxisSystemContext();
  const { width: visWidth, height: visHeight } = visSize;

  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  return useCallback(
    (x: number, y: number) => {
      const { position } = camera;

      const { topRight } = getCameraFOV(camera);
      const cameraLocalBounds = topRight.sub(position);

      const xBound = Math.max(visWidth / 2 - cameraLocalBounds.x, 0);
      const yBound = Math.max(visHeight / 2 - cameraLocalBounds.y, 0);

      position.set(
        clamp(x, -xBound, xBound),
        clamp(y, -yBound, yBound),
        position.z
      );

      camera.updateMatrixWorld();
      invalidate();
    },
    [camera, visWidth, visHeight, invalidate]
  );
}

function onWheel(evt: WheelEvent) {
  evt.preventDefault();
}

function useWheelCapture() {
  const { domElement } = useThree((state) => state.gl);

  // Handler must be registed as non-passive for `preventDefault` to have an effect
  // (React's `onWheel` prop registers handlers as passive)
  useEventListener(domElement, 'wheel', onWheel, { passive: false });
}

export function useZoomOnWheel(
  isZoomAllowed: (sourceEvent: WheelEvent) => { x: boolean; y: boolean }
) {
  const camera = useThree((state) => state.camera);
  const moveCameraTo = useMoveCameraTo();

  const onWheel = useCallback(
    (evt: CanvasEvent<WheelEvent>) => {
      const { sourceEvent, unprojectedPoint } = evt;
      const { x: zoomX, y: zoomY } = isZoomAllowed(sourceEvent);

      if (!zoomX && !zoomY) {
        return;
      }

      // sourceEvent.deltaY < 0 => Wheel down => decrease scale to reduce FOV
      const factor = sourceEvent.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
      const zoomVector = new Vector3(zoomX ? factor : 1, zoomY ? factor : 1, 1);
      camera.scale.multiply(zoomVector).min(ONE_VECTOR);

      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      const oldPosition = unprojectedPoint.clone();
      // Scale the change in position according to the zoom
      const delta = camera.position
        .clone()
        .sub(oldPosition)
        .multiply(zoomVector);
      const scaledPosition = oldPosition.add(delta);
      moveCameraTo(scaledPosition.x, scaledPosition.y);
    },
    [camera, isZoomAllowed, moveCameraTo]
  );

  useWheelCapture();

  return onWheel;
}

export function useCanvasEvents(callbacks: CanvasEventCallbacks): void {
  const { onPointerDown, onPointerMove, onPointerUp, onWheel } = callbacks;
  const { domElement } = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const getUnprojectedPoint = useCallback(
    (evt: PointerEvent | WheelEvent) => {
      const { offsetX: x, offsetY: y } = evt;
      const { width, height } = size;
      const normX = (x - width / 2) / (width / 2);
      const normY = -(y - height / 2) / (height / 2);

      return new Vector3(normX, normY, 0).unproject(camera);
    },
    [camera, size]
  );

  const handlePointerDown = useCallback(
    (sourceEvent: PointerEvent) => {
      if (onPointerDown) {
        onPointerDown({
          sourceEvent,
          unprojectedPoint: getUnprojectedPoint(sourceEvent),
        });
      }
    },
    [getUnprojectedPoint, onPointerDown]
  );

  const handlePointerMove = useCallback(
    (sourceEvent: PointerEvent) => {
      if (onPointerMove) {
        onPointerMove({
          sourceEvent,
          unprojectedPoint: getUnprojectedPoint(sourceEvent),
        });
      }
    },
    [getUnprojectedPoint, onPointerMove]
  );

  const handlePointerUp = useCallback(
    (sourceEvent: PointerEvent) => {
      if (onPointerUp) {
        onPointerUp({
          sourceEvent,
          unprojectedPoint: getUnprojectedPoint(sourceEvent),
        });
      }
    },
    [getUnprojectedPoint, onPointerUp]
  );

  const handleWheel = useCallback(
    (sourceEvent: WheelEvent) => {
      if (onWheel) {
        onWheel({
          sourceEvent,
          unprojectedPoint: getUnprojectedPoint(sourceEvent),
        });
      }
    },
    [getUnprojectedPoint, onWheel]
  );

  useEventListener(domElement, 'pointerdown', handlePointerDown);
  useEventListener(domElement, 'pointermove', handlePointerMove);
  useEventListener(domElement, 'pointerup', handlePointerUp);
  useEventListener(domElement, 'wheel', handleWheel);
}

export function useRegisterInteraction(id: string, value: Interaction) {
  const { shouldInteract, registerInteraction, unregisterInteraction } =
    useAxisSystemContext();

  useEffect(() => {
    registerInteraction(id, value);
    return () => unregisterInteraction(id);
  }, [id, registerInteraction, unregisterInteraction, value]);

  return useCallback(
    (event: MouseEvent) => shouldInteract(id, event),
    [id, shouldInteract]
  );
}
