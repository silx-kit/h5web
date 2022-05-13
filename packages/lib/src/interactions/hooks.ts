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

function useWheelCapture() {
  const { domElement } = useThree((state) => state.gl);

  const onWheel = useCallback((evt: WheelEvent) => {
    evt.preventDefault();
  }, []);

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
      const { sourceEvent, worldPt } = evt;
      const { x: zoomX, y: zoomY } = isZoomAllowed(sourceEvent);

      if (!zoomX && !zoomY) {
        return;
      }

      const zoomVector = new Vector3(
        zoomX ? ZOOM_FACTOR : 1,
        zoomY ? ZOOM_FACTOR : 1,
        1
      );

      // sourceEvent.deltaY < 0 => Wheel down => decrease scale to reduce FOV
      if (sourceEvent.deltaY < 0) {
        camera.scale.multiply(zoomVector).min(ONE_VECTOR);
      } else {
        // Use `divide` instead of `multiply` by 1 / zoomVector to avoid rounding issues (https://github.com/silx-kit/h5web/issues/1088)
        camera.scale.divide(zoomVector).min(ONE_VECTOR);
      }
      camera.updateMatrixWorld();

      const oldPosition = worldPt.clone();
      // Scale the change in position according to the zoom
      const delta = camera.position.clone().sub(oldPosition);
      const scaledDelta =
        sourceEvent.deltaY < 0
          ? delta.multiply(zoomVector)
          : delta.divide(zoomVector);
      const scaledPosition = oldPosition.add(scaledDelta);
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
  const { worldToData, cameraToHtmlMatrixInverse } = useAxisSystemContext();

  const processEvent = useCallback(
    <T extends PointerEvent | WheelEvent>(sourceEvent: T): CanvasEvent<T> => {
      const { offsetX, offsetY } = sourceEvent;

      const htmlPt = new Vector3(offsetX, offsetY, 0);
      const cameraPt = htmlPt.clone().applyMatrix4(cameraToHtmlMatrixInverse);
      const worldPt = cameraPt.clone().unproject(camera);
      const dataPt = worldToData(worldPt);

      return { htmlPt, cameraPt, worldPt, dataPt, sourceEvent };
    },
    [camera, cameraToHtmlMatrixInverse, worldToData]
  );

  const handlePointerDown = useCallback(
    (sourceEvent: PointerEvent) => {
      if (onPointerDown) {
        onPointerDown(processEvent(sourceEvent));
      }
    },
    [processEvent, onPointerDown]
  );

  const handlePointerMove = useCallback(
    (sourceEvent: PointerEvent) => {
      if (onPointerMove) {
        onPointerMove(processEvent(sourceEvent));
      }
    },
    [processEvent, onPointerMove]
  );

  const handlePointerUp = useCallback(
    (sourceEvent: PointerEvent) => {
      if (onPointerUp) {
        onPointerUp(processEvent(sourceEvent));
      }
    },
    [processEvent, onPointerUp]
  );

  const handleWheel = useCallback(
    (sourceEvent: WheelEvent) => {
      if (onWheel) {
        onWheel(processEvent(sourceEvent));
      }
    },
    [processEvent, onWheel]
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
