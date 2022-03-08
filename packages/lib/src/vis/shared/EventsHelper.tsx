import { useThree } from '@react-three/fiber';
import { useCallback, useEffect } from 'react';
import { Vector3 } from 'three';

import type { CanvasEvent } from '../models';

interface Props {
  onPointerDown?: (evt: CanvasEvent<PointerEvent>) => void;
  onPointerMove?: (evt: CanvasEvent<PointerEvent>) => void;
  onPointerUp?: (evt: CanvasEvent<PointerEvent>) => void;
  onWheel?: (evt: CanvasEvent<WheelEvent>) => void;
}

function EventsHelper(props: Props) {
  const { onPointerDown, onPointerMove, onPointerUp, onWheel } = props;
  const { domElement } = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const getUnprojectedPoint = useCallback(
    (evt: PointerEvent | WheelEvent) => {
      const { offsetX: x, offsetY: y } = evt;
      const { width, height } = size;
      const normX = (x - width / 2) / (width / 2);
      const normY = -(y - height / 2) / (height / 2);

      return new Vector3(normX, normY, 0).unproject(camera);
    },
    [camera, size]
  );

  const handlePointerDown = useCallback(
    (sourceEvent: PointerEvent) => {
      if (onPointerDown) {
        onPointerDown({
          sourceEvent,
          unprojectedPoint: getUnprojectedPoint(sourceEvent),
        });
      }
    },
    [getUnprojectedPoint, onPointerDown]
  );

  const handlePointerMove = useCallback(
    (sourceEvent: PointerEvent) => {
      if (onPointerMove) {
        onPointerMove({
          sourceEvent,
          unprojectedPoint: getUnprojectedPoint(sourceEvent),
        });
      }
    },
    [getUnprojectedPoint, onPointerMove]
  );

  const handlePointerUp = useCallback(
    (sourceEvent: PointerEvent) => {
      if (onPointerUp) {
        onPointerUp({
          sourceEvent,
          unprojectedPoint: getUnprojectedPoint(sourceEvent),
        });
      }
    },
    [getUnprojectedPoint, onPointerUp]
  );

  const handleWheel = useCallback(
    (sourceEvent: WheelEvent) => {
      if (onWheel) {
        onWheel({
          sourceEvent,
          unprojectedPoint: getUnprojectedPoint(sourceEvent),
        });
      }
    },
    [getUnprojectedPoint, onWheel]
  );

  useEffect(() => {
    domElement.addEventListener('pointerdown', handlePointerDown);
    domElement.addEventListener('pointermove', handlePointerMove);
    domElement.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('wheel', handleWheel);

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      domElement.removeEventListener('pointermove', handlePointerMove);
      domElement.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('wheel', handleWheel);
    };
  });

  return null;
}

export default EventsHelper;
