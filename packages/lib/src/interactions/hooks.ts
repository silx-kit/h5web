import { castArray } from '@h5web/shared/vis-utils';
import { useEventListener, useSyncedRef, useToggle } from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import Box from './box';
import { useInteractionsContext } from './InteractionsProvider';
import {
  type CanvasEvent,
  type InteractionConfig,
  type ModifierKey,
  type MouseEventName,
  type Selection,
  type UseDragOpts,
  type UseDragState,
} from './models';

const ZOOM_FACTOR = 0.95;
const ONE_VECTOR = new Vector3(1, 1, 1);
const MODIFIER_KEYS: ModifierKey[] = ['Alt', 'Control', 'Shift'];

export function useMoveCameraTo(): (worldPt: Vector3) => void {
  const { visSize, getFovBox } = useVisCanvasContext();

  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  return useCallback(
    (worldPt) => {
      const { position } = camera;
      const visBox = Box.fromSize(visSize);
      const fovBox = getFovBox(camera, worldPt).keepWithin(visBox);

      position.copy(fovBox.center.setZ(position.z)); // apply new position but keep `z` component as is
      camera.updateMatrixWorld();
      invalidate();
    },
    [camera, visSize, getFovBox, invalidate],
  );
}

export function useZoomOnSelection(): (selection: Selection) => void {
  const { canvasSize } = useVisCanvasContext();

  const camera = useThree((state) => state.camera);
  const moveCameraTo = useMoveCameraTo();

  return useCallback(
    ({ world: worldSelection }) => {
      const { width, height } = canvasSize;
      const zoomBox = Box.fromPoints(...worldSelection);

      // Update camera scale first (since `moveCameraTo` relies on camera scale)
      const { width: zoomWidth, height: zoomHeight } = zoomBox.size;
      camera.scale.set(
        Math.max(zoomWidth, 1) / width,
        Math.max(zoomHeight, 1) / height,
        1,
      );

      // Then move camera position
      moveCameraTo(zoomBox.center);
    },
    [camera, canvasSize, moveCameraTo],
  );
}

export function useWheelCapture(): void {
  const { canvasArea } = useVisCanvasContext();

  useEventListener(
    canvasArea,
    'wheel',
    (evt: WheelEvent) => evt.preventDefault(),
    { passive: false }, // for `preventDefault` to have an effect (React's `onWheel` prop registers handlers as passive)
  );
}

export function useZoomOnWheel(
  isZoomAllowed: (sourceEvent: WheelEvent) => { x: boolean; y: boolean },
): (evt: CanvasEvent<WheelEvent>) => void {
  const camera = useThree((state) => state.camera);
  const moveCameraTo = useMoveCameraTo();

  return (evt) => {
    const { sourceEvent, worldPt } = evt;
    const { x: zoomX, y: zoomY } = isZoomAllowed(sourceEvent);

    if (!zoomX && !zoomY) {
      return;
    }

    const zoomVector = new Vector3(
      zoomX ? ZOOM_FACTOR : 1,
      zoomY ? ZOOM_FACTOR : 1,
      1,
    );

    // sourceEvent.deltaY < 0 => Wheel down => decrease scale to reduce FOV
    if (sourceEvent.deltaY < 0) {
      camera.scale.multiply(zoomVector).min(ONE_VECTOR);
    } else {
      // Use `divide` instead of `multiply` by 1 / zoomVector to avoid rounding issues (https://github.com/silx-kit/h5web/issues/1088)
      camera.scale.divide(zoomVector).min(ONE_VECTOR);
    }

    // Scale change in position according to zoom
    const delta = camera.position.clone().sub(worldPt);
    if (sourceEvent.deltaY < 0) {
      delta.multiply(zoomVector);
    } else {
      delta.divide(zoomVector);
    }

    moveCameraTo(worldPt.clone().add(delta));
  };
}

export function useCanvasEvent<
  T extends MouseEventName,
  U extends GlobalEventHandlersEventMap[T],
>(
  mouseEventName: T,
  listener: (evt: CanvasEvent<U>) => void,
  options: AddEventListenerOptions = {},
): void {
  const listenerRef = useSyncedRef(listener); // no need to memoise listener with `useCallback`
  const camera = useThree((state) => state.camera);
  const { htmlToWorld, worldToData, canvasArea } = useVisCanvasContext();

  function handleEvent(sourceEvent: U): void {
    const { offsetX, offsetY } = sourceEvent;

    const htmlPt = new Vector3(offsetX, offsetY);
    const worldPt = htmlToWorld(camera, htmlPt);
    const dataPt = worldToData(worldPt);

    listenerRef.current({ htmlPt, worldPt, dataPt, sourceEvent });
  }

  useEventListener(canvasArea, mouseEventName, handleEvent, options);
}

export function useInteraction(
  id: string,
  config: InteractionConfig,
): (event: MouseEvent) => boolean {
  const { shouldInteract, registerInteraction, unregisterInteraction } =
    useInteractionsContext();

  useEffect(() => {
    registerInteraction(id, config);
    return () => unregisterInteraction(id);
  }, [id, registerInteraction, unregisterInteraction, config]);

  return useCallback(
    (event: MouseEvent) => shouldInteract(id, event),
    [id, shouldInteract],
  );
}

export function useModifierKeyPressed(
  modifierKey: ModifierKey | ModifierKey[] = [],
): boolean {
  const { canvasArea } = useVisCanvasContext();
  const modifierKeys = castArray(modifierKey);

  const [pressedKeys] = useState(new Map<string, boolean>());
  const [allPressed, toggleAllPressed] = useToggle(false);

  function checkAllPressed() {
    const newAllPressed = modifierKeys.every((key) => pressedKeys.get(key));
    if (allPressed !== newAllPressed) {
      toggleAllPressed(newAllPressed);
    }
  }

  useEventListener(globalThis, 'keyup', (event: KeyboardEvent) => {
    const { key } = event;
    pressedKeys.set(key, false);
    checkAllPressed();
  });

  useEventListener(globalThis, 'keydown', (event: KeyboardEvent) => {
    const { key } = event;
    pressedKeys.set(key, true);
    checkAllPressed();
  });

  /* Keyboard events are triggered only when the window has focus.
   * This ensures that the `allPressed` state gets updated (if needed) when the
   * user starts interacting with the canvas while the window is out of focus. */
  useEventListener(canvasArea, 'pointerdown', (event: PointerEvent) => {
    MODIFIER_KEYS.forEach((key) => {
      pressedKeys.set(key, event.getModifierState(key));
    });

    checkAllPressed();
  });

  return allPressed;
}

export function useDrag(opts: UseDragOpts): UseDragState {
  const { onDragEnd } = opts;

  const camera = useThree((state) => state.camera);
  const { htmlToData } = useVisCanvasContext();

  const dataStartRef = useRef<Vector3>(undefined);
  const onDragEndRef = useSyncedRef(onDragEnd);

  const [delta, setDelta] = useState<Vector3>();

  const startDrag = useCallback(
    (evt: PointerEvent) => {
      const { offsetX, offsetY, target, pointerId } = evt;

      if (target instanceof Element) {
        target.setPointerCapture(pointerId);
      }

      dataStartRef.current = htmlToData(camera, new Vector3(offsetX, offsetY));
      setDelta(new Vector3());
    },
    [camera, htmlToData],
  );

  function handlePointerMove(canvasEvt: CanvasEvent<PointerEvent>) {
    if (!dataStartRef.current) {
      return;
    }

    setDelta(canvasEvt.dataPt.sub(dataStartRef.current));
  }

  function handlePointerUp(canvasEvt: CanvasEvent<PointerEvent>) {
    if (!dataStartRef.current) {
      return;
    }

    const { dataPt, sourceEvent } = canvasEvt;
    const { target, pointerId } = sourceEvent;

    if (target instanceof Element) {
      target.releasePointerCapture(pointerId);
    }

    const finalDelta = dataPt.sub(dataStartRef.current);
    dataStartRef.current = undefined;
    setDelta(undefined);

    onDragEndRef.current(finalDelta);
  }

  useCanvasEvent('pointermove', handlePointerMove);
  useCanvasEvent('pointerup', handlePointerUp);

  return {
    delta: delta || new Vector3(),
    isDragging: !!delta,
    startDrag,
  };
}
