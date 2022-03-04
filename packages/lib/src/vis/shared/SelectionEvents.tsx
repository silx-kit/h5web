import { useThree } from '@react-three/fiber';
import { clamp } from 'lodash';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import { Vector2 } from 'three';

import type { CanvasEvent, ModifierKey, Selection } from '../models';
import { getCameraFOV, noModifierKeyPressed } from '../utils';
import { useAxisSystemContext } from './AxisSystemContext';
import EventsHelper from './EventsHelper';

interface Props {
  onSelectionStart?: () => void;
  onSelectionChange?: (points: Selection) => void;
  onSelectionEnd?: (points: Selection) => void;
  modifierKey?: ModifierKey;
  children: (points: Selection) => ReactElement;
}

function SelectionEvents(props: Props) {
  const {
    children,
    onSelectionStart,
    onSelectionChange,
    onSelectionEnd,
    modifierKey,
  } = props;

  const [startPoint, setStartPoint] = useState<Vector2>();
  const [endPoint, setEndPoint] = useState<Vector2>();
  const camera = useThree((state) => state.camera);

  const { worldToData } = useAxisSystemContext();
  const onPointerDown = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { unprojectedPoint, sourceEvent } = evt;

      const isSelectionAllowed = modifierKey
        ? sourceEvent.getModifierState(modifierKey)
        : noModifierKeyPressed(sourceEvent);
      if (!isSelectionAllowed) {
        return;
      }

      const { target, pointerId } = sourceEvent;
      (target as Element).setPointerCapture(pointerId);

      setStartPoint(worldToData(unprojectedPoint));
      setEndPoint(undefined);
      if (onSelectionStart) {
        onSelectionStart();
      }
    },
    [modifierKey, worldToData, onSelectionStart]
  );

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
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
    (evt: CanvasEvent<PointerEvent>) => {
      if (!startPoint) {
        return;
      }
      const { sourceEvent, unprojectedPoint } = evt;
      const { target, pointerId } = sourceEvent;
      (target as Element).releasePointerCapture(pointerId);

      const { topRight, bottomLeft } = getCameraFOV(camera);
      const boundedX = clamp(unprojectedPoint.x, bottomLeft.x, topRight.x);
      const boundedY = clamp(unprojectedPoint.y, bottomLeft.y, topRight.y);
      const point = worldToData(new Vector2(boundedX, boundedY));

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
    <>
      <EventsHelper {...{ onPointerDown, onPointerMove, onPointerUp }} />
      {startPoint && endPoint ? children({ startPoint, endPoint }) : null}
    </>
  );
}

export type { Props as SelectionEventsProps };
export default SelectionEvents;
