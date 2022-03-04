import type { MeshProps, ThreeEvent } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { clamp } from 'lodash';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import { Vector2 } from 'three';

import type { ModifierKey, Selection } from '../models';
import { getCameraFOV, noModifierKeyPressed } from '../utils';
import { useAxisSystemContext } from './AxisSystemContext';
import VisMesh from './VisMesh';

interface Props extends MeshProps {
  onSelectionStart?: () => void;
  onSelectionChange?: (points: Selection) => void;
  onSelectionEnd?: (points: Selection) => void;
  modifierKey?: ModifierKey;
  children: (points: Selection) => ReactElement;
}

function SelectionMesh(props: Props) {
  const {
    children,
    onSelectionStart,
    onSelectionChange,
    onSelectionEnd,
    modifierKey,
    ...meshProps
  } = props;

  const [startPoint, setStartPoint] = useState<Vector2>();
  const [endPoint, setEndPoint] = useState<Vector2>();
  const camera = useThree((state) => state.camera);

  const { worldToData } = useAxisSystemContext();

  const onPointerDown = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { sourceEvent, unprojectedPoint } = evt;
      const { target, pointerId } = sourceEvent;

      const isSelectionAllowed = modifierKey
        ? sourceEvent.getModifierState(modifierKey)
        : noModifierKeyPressed(sourceEvent);
      if (!isSelectionAllowed) {
        return;
      }

      (target as Element).setPointerCapture(pointerId);

      setStartPoint(worldToData(unprojectedPoint));
      setEndPoint(undefined);
      if (onSelectionStart) {
        onSelectionStart();
      }
    },
    [modifierKey, onSelectionStart, worldToData]
  );

  const onPointerMove = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      if (!startPoint) {
        return;
      }
      const { topRight, bottomLeft } = getCameraFOV(camera);
      const boundedX = clamp(evt.unprojectedPoint.x, bottomLeft.x, topRight.x);
      const boundedY = clamp(evt.unprojectedPoint.y, bottomLeft.y, topRight.y);

      const point = worldToData(new Vector2(boundedX, boundedY));

      setEndPoint(point);
      if (onSelectionChange) {
        onSelectionChange({
          startPoint,
          endPoint: point,
        });
      }
    },
    [camera, onSelectionChange, startPoint, worldToData]
  );

  const onPointerUp = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      if (!startPoint) {
        return;
      }
      const { sourceEvent, unprojectedPoint } = evt;
      const { target, pointerId } = sourceEvent;
      const { topRight, bottomLeft } = getCameraFOV(camera);
      const boundedX = clamp(unprojectedPoint.x, bottomLeft.x, topRight.x);
      const boundedY = clamp(unprojectedPoint.y, bottomLeft.y, topRight.y);
      const point = worldToData(new Vector2(boundedX, boundedY));
      (target as Element).releasePointerCapture(pointerId);
      if (onSelectionEnd) {
        onSelectionEnd({
          startPoint,
          endPoint: point,
        });
      }
      setStartPoint(undefined);
      setEndPoint(undefined);
    },
    [startPoint, camera, worldToData, onSelectionEnd]
  );

  return (
    <VisMesh {...{ onPointerMove, onPointerUp, onPointerDown, ...meshProps }}>
      <meshBasicMaterial opacity={0} transparent />
      {startPoint && endPoint ? children({ startPoint, endPoint }) : null}
    </VisMesh>
  );
}

export type { Props as SelectionMeshProps };
export default SelectionMesh;
