import { useThree } from '@react-three/fiber';
import { useRef, useCallback } from 'react';
import type { Vector3 } from 'three';

import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import { useCanvasEvents, useMoveCameraTo } from './hooks';
import type { CanvasEvent } from './models';

interface Props {
  disabled?: boolean;
}

function Pan(props: Props) {
  const { disabled } = props;
  const { shouldInteract } = useAxisSystemContext();

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

      if (shouldInteract('Pan', sourceEvent)) {
        (target as Element).setPointerCapture(pointerId); // https://stackoverflow.com/q/28900077/758806
        startOffsetPosition.current = unprojectedPoint.clone();
      }
    },
    [shouldInteract, disabled]
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

  useCanvasEvents({ onPointerDown, onPointerMove, onPointerUp });

  return null;
}

export default Pan;
