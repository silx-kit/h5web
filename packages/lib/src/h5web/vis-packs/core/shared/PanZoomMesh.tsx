import { useRef, useCallback, useEffect } from 'react';
import type { Vector3 } from 'three';
import { useThree } from '@react-three/fiber';
import { clamp } from 'lodash';
import { useWheelCapture } from '../hooks';
import type { ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events';
import { useAxisSystemContext } from './AxisSystemContext';

const ZOOM_FACTOR = 0.95;

function PanZoomMesh() {
  const { visSize } = useAxisSystemContext();

  const camera = useThree((state) => state.camera);
  const { width, height } = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders

  const moveCameraTo = useCallback(
    (x: number, y: number) => {
      const { position, zoom } = camera;

      const xBound = Math.max(visSize.width - width / zoom, 0) / 2;
      const yBound = Math.max(visSize.height - height / zoom, 0) / 2;

      position.set(
        clamp(x, -xBound, xBound),
        clamp(y, -yBound, yBound),
        position.z
      );

      camera.updateMatrixWorld();
      invalidate();
    },
    [camera, height, invalidate, visSize, width]
  );

  const onPointerDown = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { target, pointerId, unprojectedPoint } = evt;
      (target as Element).setPointerCapture(pointerId); // https://stackoverflow.com/q/28900077/758806

      const projectedPoint = camera.worldToLocal(unprojectedPoint.clone());
      startOffsetPosition.current = camera.position.clone().add(projectedPoint);
    },
    [camera]
  );

  const onPointerUp = useCallback((evt: ThreeEvent<PointerEvent>) => {
    const { target, pointerId } = evt;
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

      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());
      const { x: pointerX, y: pointerY } = projectedPoint;
      const { x: startX, y: startY } = startOffsetPosition.current;

      moveCameraTo(startX - pointerX, startY - pointerY);
    },
    [camera, moveCameraTo]
  );

  const onWheel = useCallback(
    (evt: ThreeEvent<WheelEvent>) => {
      const factor = evt.deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

      camera.zoom = Math.max(1, camera.zoom * factor);
      camera.updateProjectionMatrix();

      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());
      const { x: pointerX, y: pointerY } = projectedPoint;
      const { x: camX, y: camY } = camera.position;

      moveCameraTo(
        camX + pointerX * (1 - 1 / factor),
        camY + pointerY * (1 - 1 / factor)
      );
    },
    [camera, moveCameraTo]
  );

  useEffect(() => {
    // Move camera on resize to stay within mesh bounds
    moveCameraTo(camera.position.x, camera.position.y);
  }, [camera, moveCameraTo]);

  useWheelCapture();

  return (
    <mesh {...{ onPointerMove, onPointerUp, onPointerDown, onWheel }}>
      <meshBasicMaterial opacity={0} transparent />
      <planeGeometry args={[width, height]} />
    </mesh>
  );
}

export default PanZoomMesh;
