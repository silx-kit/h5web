import type { MeshProps, ThreeEvent } from '@react-three/fiber';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { Vector2 } from 'three';

import type { ModifierKey } from '../models';
import { noModifierKeyPressed } from '../utils';
import { useAxisSystemContext } from './AxisSystemContext';
import VisMesh from './VisMesh';

export interface SelectionMeshProps extends MeshProps {
  onSelection?: (startPoint: Vector2, endPoint: Vector2) => void;
  modifierKey?: ModifierKey;
}

interface Props extends SelectionMeshProps {
  selectionComponent: (props: {
    startPoint: Vector2;
    endPoint: Vector2;
  }) => ReactElement;
}

function SelectionMesh(props: Props) {
  const {
    selectionComponent: Selection,
    onSelection,
    modifierKey,
    ...meshProps
  } = props;
  const { worldToData, dataToWorld } = useAxisSystemContext();

  const [startPoint, setStartPoint] = useState<Vector2>();
  const [endPoint, setEndPoint] = useState<Vector2>();
  const [isDragging, setDrag] = useState(false);

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
      const point = worldToData(unprojectedPoint);

      setStartPoint(point);
      setEndPoint(point);
      setDrag(true);
    },
    [worldToData, modifierKey]
  );

  const onPointerMove = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      if (!isDragging) {
        return;
      }
      const point = worldToData(evt.unprojectedPoint);

      setEndPoint(point);
    },
    [worldToData, isDragging]
  );

  const onPointerUp = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      if (!isDragging) {
        return;
      }
      const { sourceEvent, unprojectedPoint } = evt;
      const { target, pointerId } = sourceEvent;
      const point = worldToData(unprojectedPoint);

      (target as Element).releasePointerCapture(pointerId);
      setEndPoint(point);
      setDrag(false);
      if (onSelection && startPoint) {
        onSelection(startPoint, point);
      }
    },
    [onSelection, startPoint, worldToData, isDragging]
  );

  return (
    <VisMesh {...{ onPointerMove, onPointerUp, onPointerDown, ...meshProps }}>
      <meshBasicMaterial opacity={0} transparent />
      {startPoint && endPoint && (
        <Selection
          startPoint={dataToWorld(startPoint)}
          endPoint={dataToWorld(endPoint)}
        />
      )}
    </VisMesh>
  );
}

export default SelectionMesh;
