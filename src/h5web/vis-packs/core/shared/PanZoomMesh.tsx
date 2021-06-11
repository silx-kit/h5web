import { useRef, useCallback, useEffect } from 'react';
import type { Vector3 } from 'three';
import { useThree } from '@react-three/fiber';
import { clamp } from 'lodash';
import { useCanvasScales, useWheelCapture } from '../hooks';
import type { ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events';
import type { Domain } from '../models';

const ZOOM_FACTOR = 0.95;

interface Props {
  abscissaDomain: Domain;
  ordinateDomain: Domain;
}

function PanZoomMesh(props: Props) {
  const { abscissaDomain, ordinateDomain } = props;

  const camera = useThree((state) => state.camera);
  const { width, height } = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  const startOffsetPosition = useRef<Vector3>(); // `useRef` to avoid re-renders

  const { abscissaScale, ordinateScale } = useCanvasScales();
  const [minAbscissa, maxAbscissa] = abscissaDomain;
  const [minOrdinate, maxOrdinate] = ordinateDomain;
  const meshWidth = abscissaScale(maxAbscissa) - abscissaScale(minAbscissa);
  const meshHeight = ordinateScale(maxOrdinate) - ordinateScale(minOrdinate);

  const moveCameraTo = useCallback(
    (x: number, y: number) => {
      const { position, zoom } = camera;

      const xBound = Math.max(meshWidth - width / zoom, 0) / 2;
      const yBound = Math.max(meshHeight - height / zoom, 0) / 2;

      position.set(
        clamp(x, -xBound, xBound),
        clamp(y, -yBound, yBound),
        position.z
      );

      camera.updateMatrixWorld();
      invalidate();
    },
    [camera, meshWidth, width, meshHeight, height, invalidate]
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
