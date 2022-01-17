import { useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events';
import { clamp } from 'lodash';
import { useRef, useCallback, useEffect } from 'react';
import { Vector2, Vector3 } from 'three';

import { useWheelCapture } from '../hooks';
import { useAxisSystemContext } from './AxisSystemContext';

const ZOOM_FACTOR = 0.95;

const CAMERA_TOP_RIGHT = new Vector3(1, 1, 0);
const ONE_VECTOR = new Vector3(1, 1, 1);

function PanZoomMesh() {
  const { abscissaScale, ordinateScale, visSize } = useAxisSystemContext();
  const { width: visWidth, height: visHeight } = visSize;

  const camera = useThree((state) => state.camera);
  const { width, height } = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders
  const viewportCenter = useRef<Vector2>();

  const moveCameraTo = useCallback(
    (x: number, y: number) => {
      /* Save mesh coordinates at requested camera position so we can keep this point
           in the centre of the viewport on resize. */
      viewportCenter.current = new Vector2(
        abscissaScale.invert(x),
        ordinateScale.invert(y)
      );
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
    [abscissaScale, ordinateScale, camera, visWidth, visHeight, invalidate]
  );

  const onPointerDown = useCallback((evt: ThreeEvent<PointerEvent>) => {
    const { sourceEvent, unprojectedPoint } = evt;
    const { target, pointerId } = sourceEvent;
    (target as Element).setPointerCapture(pointerId); // https://stackoverflow.com/q/28900077/758806

    startOffsetPosition.current = unprojectedPoint.clone();
  }, []);

  const onPointerUp = useCallback((evt: ThreeEvent<PointerEvent>) => {
    const { sourceEvent } = evt;
    const { target, pointerId } = sourceEvent;
    (target as Element).releasePointerCapture(pointerId); // https://stackoverflow.com/q/28900077/758806

    startOffsetPosition.current = undefined;
  }, []);

  const onPointerMove = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      if (!startOffsetPosition.current) {
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
    [camera, moveCameraTo]
  );

  const onWheel = useCallback(
    (evt: ThreeEvent<WheelEvent>) => {
      const { sourceEvent, unprojectedPoint } = evt;
      const factor = sourceEvent.deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

      const zoomVector = new Vector3(1 / factor, 1 / factor, 1);
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
    [camera, moveCameraTo]
  );

  useEffect(() => {
    if (viewportCenter.current) {
      // On resize, move camera to the latest saved viewport center coordinates
      const { x, y } = viewportCenter.current;
      moveCameraTo(abscissaScale(x), ordinateScale(y));
    }
  }, [abscissaScale, viewportCenter, moveCameraTo, ordinateScale]);

  useWheelCapture();

  return (
    <mesh {...{ onPointerMove, onPointerUp, onPointerDown, onWheel }}>
      <meshBasicMaterial opacity={0} transparent />
      <planeGeometry args={[width, height]} />
    </mesh>
  );
}

export default PanZoomMesh;
