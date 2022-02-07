import { useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useRef, useCallback } from 'react';
import type { Vector3 } from 'three';

import type { ModifierKey } from '../models';
import { noModifierKeyPressed } from '../utils';
import { useMoveCameraTo } from './hooks';

interface Props {
  disabled?: boolean;
  modifierKey?: ModifierKey;
}

function PanMesh(props: Props) {
  const { disabled, modifierKey } = props;

  const camera = useThree((state) => state.camera);
  const { width, height } = useThree((state) => state.size);

  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders

  const moveCameraTo = useMoveCameraTo();

  const onPointerDown = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { sourceEvent, unprojectedPoint } = evt;
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

  const onPointerUp = useCallback((evt: ThreeEvent<PointerEvent>) => {
    const { sourceEvent } = evt;
    const { target, pointerId } = sourceEvent;
    (target as Element).releasePointerCapture(pointerId); // https://stackoverflow.com/q/28900077/758806

    startOffsetPosition.current = undefined;
  }, []);

  const onPointerMove = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      if (disabled || !startOffsetPosition.current) {
        return;
      }

      // Prevent events from reaching tooltip mesh when panning
      evt.stopPropagation();

      const delta = startOffsetPosition.current
        .clone()
        .sub(evt.unprojectedPoint);
      const target = camera.position.clone().add(delta);

      moveCameraTo(target.x, target.y);
    },
    [camera, disabled, moveCameraTo]
  );

  return (
    <mesh {...{ onPointerMove, onPointerUp, onPointerDown }}>
      <meshBasicMaterial opacity={0} transparent />
      <planeGeometry args={[width, height]} />
    </mesh>
  );
}

export default PanMesh;
