import { useThree } from '@react-three/fiber';
import { useRef, useCallback } from 'react';
import type { Vector3 } from 'three';

import {
  useCanvasEvents,
  useModifierKeyPressed,
  useMoveCameraTo,
  useInteraction,
} from './hooks';
import type { CanvasEvent, Interaction } from './models';

function Pan(props: Interaction) {
  const { modifierKey } = props;

  const camera = useThree((state) => state.camera);
  const shouldInteract = useInteraction('Pan', props);
  const moveCameraTo = useMoveCameraTo();

  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders
  const isModifierKeyPressed = useModifierKeyPressed(modifierKey);

  const onPointerDown = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { unprojectedPoint, sourceEvent } = evt;
      const { target, pointerId } = sourceEvent;

      if (shouldInteract(sourceEvent)) {
        (target as Element).setPointerCapture(pointerId); // https://stackoverflow.com/q/28900077/758806
        startOffsetPosition.current = unprojectedPoint.clone();
      }
    },
    [shouldInteract]
  );

  const onPointerUp = useCallback((evt: CanvasEvent<PointerEvent>) => {
    const { sourceEvent } = evt;
    const { target, pointerId } = sourceEvent;
    (target as Element).releasePointerCapture(pointerId); // https://stackoverflow.com/q/28900077/758806

    startOffsetPosition.current = undefined;
  }, []);

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!startOffsetPosition.current || !isModifierKeyPressed) {
        return;
      }

      const { unprojectedPoint } = evt;
      const delta = startOffsetPosition.current.clone().sub(unprojectedPoint);
      const target = camera.position.clone().add(delta);

      moveCameraTo(target.x, target.y);
    },
    [camera, isModifierKeyPressed, moveCameraTo]
  );

  useCanvasEvents({ onPointerDown, onPointerMove, onPointerUp });

  return null;
}

export default Pan;
