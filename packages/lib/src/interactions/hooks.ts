import {
  useEventListener,
  useKeyboardEvent,
  useToggle,
} from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import { useCallback, useEffect } from 'react';
import { Vector2, Vector3 } from 'three';

import { useAxisSystemContext } from '../vis/shared/AxisSystemProvider';
import { getWorldFOV } from '../vis/utils';
import { useInteractionsContext } from './InteractionsProvider';
import type {
  CanvasEvent,
  CanvasEventCallbacks,
  Interaction,
  ModifierKey,
} from './models';
import { clampPositionToArea } from './utils';

const ZOOM_FACTOR = 0.95;

const ONE_VECTOR = new Vector3(1, 1, 1);

export function useMoveCameraTo() {
  const { visSize } = useAxisSystemContext();

  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  return useCallback(
    (x: number, y: number) => {
      const { position } = camera;

      const { topRight, bottomLeft } = getWorldFOV(camera);
      const width = Math.abs(topRight.x - bottomLeft.x);
      const height = Math.abs(topRight.y - bottomLeft.y);

      const clampedPosition = clampPositionToArea(
        new Vector2(x, y),
        { width, height },
        visSize
      );

      position.set(clampedPosition.x, clampedPosition.y, position.z);

      camera.updateMatrixWorld();
      invalidate();
    },
    [camera, visSize, invalidate]
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

export function useInteraction(id: string, value: Interaction) {
  const { shouldInteract, registerInteraction, unregisterInteraction } =
    useInteractionsContext();

  useEffect(() => {
    registerInteraction(id, value);
    return () => unregisterInteraction(id);
  }, [id, registerInteraction, unregisterInteraction, value]);

  return useCallback(
    (event: MouseEvent) => shouldInteract(id, event),
    [id, shouldInteract]
  );
}

export function useModifierKeyPressed(
  modifierKey: ModifierKey | undefined
): boolean {
  const [isPressed, togglePressed] = useToggle(true);

  useKeyboardEvent(modifierKey, () => togglePressed(), [], { event: 'keyup' });
  useKeyboardEvent(
    modifierKey,
    () => {
      // `keydown` is fired repeatedly, so make sure we toggle only once
      if (!isPressed) {
        togglePressed();
      }
    },
    [],
    { event: 'keydown' }
  );

  return isPressed;
}
