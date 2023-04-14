import { useThree } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import { type Vector3 } from 'three';

import {
  useCanvasEvents,
  useInteraction,
  useModifierKeyPressed,
  useMoveCameraTo,
} from './hooks';
import {
  type CanvasEvent,
  type CommonInteractionProps,
  MouseButton,
} from './models';
import { getModifierKeyArray } from './utils';

interface Props extends CommonInteractionProps {
  id?: string;
  button?: MouseButton | MouseButton[];
}

function Pan(props: Props) {
  const {
    id = 'Pan',
    button = MouseButton.Left,
    modifierKey,
    disabled,
  } = props;

  const modifierKeys = getModifierKeyArray(modifierKey);
  const shouldInteract = useInteraction(id, {
    button,
    modifierKeys,
    disabled,
  });

  const camera = useThree((state) => state.camera);
  const moveCameraTo = useMoveCameraTo();

  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders
  const isModifierKeyPressed = useModifierKeyPressed(modifierKeys);

  const onPointerDown = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { worldPt, sourceEvent } = evt;
      const { target, pointerId } = sourceEvent;

      if (shouldInteract(sourceEvent)) {
        (target as Element).setPointerCapture(pointerId); // https://stackoverflow.com/q/28900077/758806
        startOffsetPosition.current = worldPt.clone();
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

      const { worldPt } = evt;
      const delta = startOffsetPosition.current.clone().sub(worldPt);
      moveCameraTo(camera.position.clone().add(delta));
    },
    [camera, isModifierKeyPressed, moveCameraTo]
  );

  useCanvasEvents({ onPointerDown, onPointerMove, onPointerUp });

  return null;
}

export { type Props as PanProps };
export default Pan;
