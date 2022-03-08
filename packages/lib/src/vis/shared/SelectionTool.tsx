import { useThree } from '@react-three/fiber';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { Vector2 } from 'three';

import type { CanvasEvent, ModifierKey, Selection } from '../models';
import { boundPointToFOV, checkModifierKey } from '../utils';
import { useAxisSystemContext } from './AxisSystemContext';
import { useCanvasEvents } from './hooks';

interface Props {
  onSelectionStart?: () => void;
  onSelectionChange?: (points: Selection) => void;
  onSelectionEnd?: (points: Selection) => void;
  modifierKey?: ModifierKey;
  children: (points: Selection) => ReactElement;
}

function SelectionTool(props: Props) {
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

      const isSelectionAllowed = checkModifierKey(modifierKey, sourceEvent);
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
      const point = worldToData(boundPointToFOV(evt.unprojectedPoint, camera));

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

      const point = worldToData(boundPointToFOV(unprojectedPoint, camera));

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

  useCanvasEvents({ onPointerDown, onPointerMove, onPointerUp });

  if (!startPoint || !endPoint) {
    return null;
  }

  return children({ startPoint, endPoint });
}

export type { Props as SelectionProps };
export { SelectionTool as default };
