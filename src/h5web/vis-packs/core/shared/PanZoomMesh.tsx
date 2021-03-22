import { useRef, useCallback, useEffect, ReactElement } from 'react';
import type { Vector3 } from 'three';
import { PointerEvent, WheelEvent, useThree } from 'react-three-fiber';
import { clamp } from 'lodash-es';
import Html from './Html';
import { useWheelCapture } from '../hooks';

const ZOOM_FACTOR = 0.95;

function PanZoomMesh(): ReactElement {
  const { camera, invalidate, size } = useThree();
  const { width, height } = size;

  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders

  const moveCameraTo = useCallback(
    (x: number, y: number) => {
      const { position, zoom } = camera;

      const factor = (1 - 1 / zoom) / 2;
      const xBound = width * factor;
      const yBound = height * factor;

      position.set(
        clamp(x, -xBound, xBound),
        clamp(y, -yBound, yBound),
        position.z
      );

      invalidate();
    },
    [camera, height, invalidate, width]
  );

  const onPointerDown = useCallback(
    (evt: PointerEvent) => {
      const { currentTarget, pointerId, unprojectedPoint } = evt;
      currentTarget.setPointerCapture(pointerId);

      const projectedPoint = camera.worldToLocal(unprojectedPoint.clone());
      startOffsetPosition.current = camera.position.clone().add(projectedPoint);
    },
    [camera]
  );

  const onPointerUp = useCallback((evt: PointerEvent) => {
    const { currentTarget, pointerId } = evt;
    currentTarget.releasePointerCapture(pointerId);

    startOffsetPosition.current = undefined;
  }, []);

  const onPointerMove = useCallback(
    (evt: PointerEvent) => {
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
    (evt: WheelEvent) => {
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

  const wheelCaptureRef = useWheelCapture();

  return (
    <>
      <mesh {...{ onPointerMove, onPointerUp, onPointerDown, onWheel }}>
        <meshBasicMaterial attach="material" opacity={0} transparent />
        <planeGeometry attach="geometry" args={[width, height]} />
      </mesh>
      <Html ref={wheelCaptureRef} />
    </>
  );
}

export default PanZoomMesh;
