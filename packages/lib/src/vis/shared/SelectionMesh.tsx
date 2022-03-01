import type { MeshProps, ThreeEvent } from '@react-three/fiber';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { Vector2 } from 'three';

import type { ModifierKey, Selection } from '../models';
import { noModifierKeyPressed } from '../utils';
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
      const point = worldToData(evt.unprojectedPoint);

      setEndPoint(point);
      if (onSelectionChange) {
        onSelectionChange({
          startPoint,
          endPoint: point,
        });
      }
    },
    [onSelectionChange, startPoint, worldToData]
  );

  const onPointerUp = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      if (!startPoint) {
        return;
      }
      const { sourceEvent, unprojectedPoint } = evt;
      const { target, pointerId } = sourceEvent;
      const point = worldToData(unprojectedPoint);

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
    [startPoint, onSelectionEnd, worldToData]
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
