import type { ThreeEvent } from '@react-three/fiber';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { Vector3 } from 'three';
import { Vector2 } from 'three';

import { useAxisSystemContext } from './AxisSystemContext';
import VisMesh from './VisMesh';

interface Props {
  selectionComponent: (props: {
    startPoint: Vector2;
    endPoint: Vector2;
  }) => ReactElement;
}

function SelectionMesh(props: Props) {
  const { selectionComponent: Selection } = props;
  const { abscissaScale, ordinateScale } = useAxisSystemContext();

  const worldToData = useCallback(
    (vec: Vector3) =>
      new Vector2(abscissaScale.invert(vec.x), ordinateScale.invert(vec.y)),
    [abscissaScale, ordinateScale]
  );

  const dataToWorld = useCallback(
    (vec: Vector2) => new Vector2(abscissaScale(vec.x), ordinateScale(vec.y)),
    [abscissaScale, ordinateScale]
  );

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
    },
    [worldToData]
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
