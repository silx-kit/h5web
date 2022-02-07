import type { ThreeEvent } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { clamp } from 'lodash';
import { useCallback } from 'react';
import { Vector3 } from 'three';

import { useWheelCapture } from '../hooks';
import { CAMERA_TOP_RIGHT } from '../utils';
import { useAxisSystemContext } from './AxisSystemContext';

const ONE_VECTOR = new Vector3(1, 1, 1);

export function useMoveCameraTo() {
  const { visSize } = useAxisSystemContext();
  const { width: visWidth, height: visHeight } = visSize;

  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  return useCallback(
    (x: number, y: number) => {
      const { position } = camera;

      // Unproject from normalized camera space (-1, -1) to (1, 1) to world space and subtract camera position to get bounds
      const cameraLocalBounds = CAMERA_TOP_RIGHT.clone()
        .unproject(camera)
        .sub(position);

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

export function useZoomOnWheel(
  zoomVectorFromEvent: (sourceEvent: WheelEvent) => Vector3,
  disabled?: boolean
) {
  const camera = useThree((state) => state.camera);
  const moveCameraTo = useMoveCameraTo();

  const onWheel = useCallback(
    (evt: ThreeEvent<WheelEvent>) => {
      const { sourceEvent, unprojectedPoint } = evt;

      if (disabled) {
        return;
      }

      const zoomVector = zoomVectorFromEvent(sourceEvent);
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
    [disabled, camera, zoomVectorFromEvent, moveCameraTo]
  );

  useWheelCapture();

  return onWheel;
}
