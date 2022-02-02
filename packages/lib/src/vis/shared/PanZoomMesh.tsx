import { useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { clamp } from 'lodash';
import { useRef, useCallback, useEffect } from 'react';
import { Vector2, Vector3 } from 'three';

import { useWheelCapture } from '../hooks';
import type { ModifierKey } from '../models';
import { CAMERA_TOP_RIGHT, noModifierKeyPressed } from '../utils';
import { useAxisSystemContext } from './AxisSystemContext';

const ZOOM_FACTOR = 0.95;
const ONE_VECTOR = new Vector3(1, 1, 1);

interface Props {
  pan?: boolean;
  zoom?: boolean;
  xZoom?: boolean;
  yZoom?: boolean;
  panKey?: ModifierKey;
  xZoomKey?: ModifierKey;
  yZoomKey?: ModifierKey;
}

function PanZoomMesh(props: Props) {
  const {
    pan = true,
    zoom = true,
    xZoom = false,
    yZoom = false,
    panKey,
    xZoomKey = 'Alt',
    yZoomKey = 'Shift',
  } = props;
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

  const onPointerDown = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { sourceEvent, unprojectedPoint } = evt;
      const { target, pointerId } = sourceEvent;

      if (!pan) {
        return;
      }

      const isPanAllowed = panKey
        ? sourceEvent.getModifierState(panKey)
        : noModifierKeyPressed(sourceEvent);
      if (isPanAllowed) {
        (target as Element).setPointerCapture(pointerId); // https://stackoverflow.com/q/28900077/758806
        startOffsetPosition.current = unprojectedPoint.clone();
      }
    },
    [pan, panKey]
  );

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

      if (!zoom) {
        return;
      }

      const factor = sourceEvent.deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

      const noKeyPressed = noModifierKeyPressed(sourceEvent);
      const zoomVector = new Vector3(
        noKeyPressed || (xZoom && sourceEvent.getModifierState(xZoomKey))
          ? 1 / factor
          : 1,
        noKeyPressed || (yZoom && sourceEvent.getModifierState(yZoomKey))
          ? 1 / factor
          : 1,
        1
      );
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
    [zoom, xZoom, xZoomKey, yZoom, yZoomKey, camera, moveCameraTo]
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

export type { Props as PanZoomProps };
export default PanZoomMesh;
