import type { ThreeEvent } from '@react-three/fiber';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import { Vector2 } from 'three';

import VisMesh from './VisMesh';

interface Props {
  selectionComponent: (props: {
    startPoint: Vector2;
    endPoint: Vector2;
  }) => ReactElement;
}

function SelectionMesh(props: Props) {
  const { selectionComponent: Selection } = props;

  const [startPoint, setStartPoint] = useState<Vector2>();
  const [endPoint, setEndPoint] = useState<Vector2>();
  const [isDragging, setDrag] = useState(false);

  const onPointerDown = useCallback((evt: ThreeEvent<PointerEvent>) => {
    const { sourceEvent, unprojectedPoint } = evt;
    const { target, pointerId } = sourceEvent;
    (target as Element).setPointerCapture(pointerId);
    setStartPoint(new Vector2(unprojectedPoint.x, unprojectedPoint.y));
    setEndPoint(new Vector2(unprojectedPoint.x, unprojectedPoint.y));
    setDrag(true);
  }, []);

  const onPointerMove = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      if (!isDragging) {
        return;
      }
      setEndPoint(new Vector2(evt.unprojectedPoint.x, evt.unprojectedPoint.y));
    },
    [isDragging]
  );

  const onPointerUp = useCallback((evt: ThreeEvent<PointerEvent>) => {
    const { sourceEvent, unprojectedPoint } = evt;
    const { target, pointerId } = sourceEvent;

    (target as Element).releasePointerCapture(pointerId);
    setEndPoint(new Vector2(unprojectedPoint.x, unprojectedPoint.y));
    setDrag(false);
  }, []);

  return (
    <>
      <VisMesh {...{ onPointerMove, onPointerUp, onPointerDown }}>
        <meshBasicMaterial opacity={0} transparent />
      </VisMesh>
      {startPoint && endPoint && (
        <Selection startPoint={startPoint} endPoint={endPoint} />
      )}
    </>
  );
}

export default SelectionMesh;
