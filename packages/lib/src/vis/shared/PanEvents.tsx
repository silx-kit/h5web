import { useThree } from '@react-three/fiber';
import { useRef, useCallback } from 'react';
import type { Vector3 } from 'three';

import type { CanvasEvent, ModifierKey } from '../models';
import { noModifierKeyPressed } from '../utils';
import EventsHelper from './EventsHelper';
import { useMoveCameraTo } from './hooks';

interface Props {
  disabled?: boolean;
  modifierKey?: ModifierKey;
}

function PanEvents(props: Props) {
  const { disabled, modifierKey } = props;

  const camera = useThree((state) => state.camera);

  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders

  const moveCameraTo = useMoveCameraTo();

  const onPointerDown = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { unprojectedPoint, sourceEvent } = evt;
      const { target, pointerId } = sourceEvent;

      if (disabled) {
        return;
      }

      const isPanAllowed = modifierKey
        ? sourceEvent.getModifierState(modifierKey)
        : noModifierKeyPressed(sourceEvent);
      if (isPanAllowed) {
        (target as Element).setPointerCapture(pointerId); // https://stackoverflow.com/q/28900077/758806
        startOffsetPosition.current = unprojectedPoint.clone();
      }
    },
    [disabled, modifierKey]
  );

  const onPointerUp = useCallback((evt: CanvasEvent<PointerEvent>) => {
    const { sourceEvent } = evt;
    const { target, pointerId } = sourceEvent;
    (target as Element).releasePointerCapture(pointerId); // https://stackoverflow.com/q/28900077/758806

    startOffsetPosition.current = undefined;
  }, []);

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (disabled || !startOffsetPosition.current) {
        return;
      }
      const { unprojectedPoint, sourceEvent } = evt;

      // Prevent events from reaching tooltip mesh when panning
      sourceEvent.stopPropagation();

      const delta = startOffsetPosition.current.clone().sub(unprojectedPoint);
      const target = camera.position.clone().add(delta);

      moveCameraTo(target.x, target.y);
    },
    [camera, disabled, moveCameraTo]
  );

  return <EventsHelper {...{ onPointerMove, onPointerUp, onPointerDown }} />;
}

export default PanEvents;
