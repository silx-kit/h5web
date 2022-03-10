import { useKeyboardEvent, useToggle } from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { Vector2 } from 'three';

import type { CanvasEvent, ModifierKey, Selection } from '../models';
import { boundPointToFOV } from '../utils';
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
  const [isAllowed, toggleAllowed] = useToggle(!modifierKey);
  const camera = useThree((state) => state.camera);

  const { worldToData } = useAxisSystemContext();
  const onPointerDown = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!isAllowed) {
        return;
      }

      const { unprojectedPoint, sourceEvent } = evt;
      const { target, pointerId } = sourceEvent;
      (target as Element).setPointerCapture(pointerId);

      setStartPoint(worldToData(unprojectedPoint));
      setEndPoint(undefined);
      onSelectionStart?.();
    },
    [isAllowed, worldToData, onSelectionStart]
  );

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!startPoint) {
        return;
      }
      const point = worldToData(boundPointToFOV(evt.unprojectedPoint, camera));
      setEndPoint(point);

      if (isAllowed && onSelectionChange) {
        onSelectionChange({
          startPoint,
          endPoint: point,
        });
      }
    },
    [camera, isAllowed, onSelectionChange, startPoint, worldToData]
  );

  const onPointerUp = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!startPoint) {
        return;
      }
      const { sourceEvent, unprojectedPoint } = evt;
      const { target, pointerId } = sourceEvent;
      (target as Element).releasePointerCapture(pointerId);
      setStartPoint(undefined);
      setEndPoint(undefined);

      if (isAllowed && onSelectionEnd) {
        onSelectionEnd({
          startPoint,
          endPoint: worldToData(boundPointToFOV(unprojectedPoint, camera)),
        });
      }
    },
    [startPoint, isAllowed, worldToData, camera, onSelectionEnd]
  );

  useCanvasEvents({ onPointerDown, onPointerMove, onPointerUp });

  useKeyboardEvent(modifierKey, () => toggleAllowed(), [modifierKey], {
    event: 'keydown',
  });
  useKeyboardEvent(modifierKey, () => toggleAllowed(), [modifierKey], {
    event: 'keyup',
  });

  if (!startPoint || !endPoint || !isAllowed) {
    return null;
  }

  return children({ startPoint, endPoint });
}

export type { Props as SelectionProps };
export { SelectionTool as default };
