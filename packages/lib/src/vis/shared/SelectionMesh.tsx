import type { ThreeEvent } from '@react-three/fiber';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { Vector2 } from 'three';

import { useAxisSystemContext } from './AxisSystemContext';
import VisMesh from './VisMesh';

interface Props {
  selectionComponent: (props: {
    startPoint: Vector2;
    endPoint: Vector2;
  }) => ReactElement;
  onSelection?: (startPoint: Vector2, endPoint: Vector2) => void;
}

function SelectionMesh(props: Props) {
  const { selectionComponent: Selection, onSelection } = props;
  const { worldToData, dataToWorld } = useAxisSystemContext();

  const [startPoint, setStartPoint] = useState<Vector2>();
  const [endPoint, setEndPoint] = useState<Vector2>();
  const [isDragging, setDrag] = useState(false);

  const onPointerDown = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { sourceEvent, unprojectedPoint } = evt;
      const { target, pointerId } = sourceEvent;
      (target as Element).setPointerCapture(pointerId);

      const point = worldToData(unprojectedPoint);

      setStartPoint(point);
      setEndPoint(point);
      setDrag(true);
    },
    [worldToData]
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
    [onSelection, startPoint, worldToData]
  );

  return (
    <VisMesh {...{ onPointerMove, onPointerUp, onPointerDown }}>
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
