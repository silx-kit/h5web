import { useKeyboardEvent, useRafState } from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { Vector2 } from 'three';

import { useAxisSystemContext } from '../vis/shared/AxisSystemProvider';
import {
  useCanvasEvents,
  useModifierKeyPressed,
  useInteraction,
} from './hooks';
import type { CanvasEvent, Interaction, Selection } from './models';
import { boundPointToFOV } from './utils';

interface Props extends Interaction {
  onSelectionStart?: () => void;
  onSelectionChange?: (points: Selection) => void;
  onSelectionEnd?: (points: Selection) => void;
  id?: string;
  children: (points: Selection) => ReactElement;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function SelectionTool(props: Props) {
  const {
    children,
    onSelectionStart,
    onSelectionChange,
    onSelectionEnd,
    id = 'Selection',
    modifierKey,
    disabled,
  } = props;

  const camera = useThree((state) => state.camera);
  const { worldToData } = useAxisSystemContext();
  const shouldInteract = useInteraction(id, { modifierKey, disabled });

  const [startPoint, setStartPoint] = useState<Vector2>();
  const [endPoint, setEndPoint] = useRafState<Vector2 | undefined>(undefined);
  const isModifierKeyPressed = useModifierKeyPressed(modifierKey);

  const onPointerDown = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { dataPt, sourceEvent } = evt;
      if (!shouldInteract(sourceEvent)) {
        return;
      }

      const { target, pointerId } = sourceEvent;
      (target as Element).setPointerCapture(pointerId);
      setStartPoint(dataPt);

      if (onSelectionStart) {
        onSelectionStart();
      }
    },
    [onSelectionStart, shouldInteract]
  );

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!startPoint) {
        return;
      }

      const { worldPt, sourceEvent } = evt;
      const endPoint = worldToData(boundPointToFOV(worldPt, camera));
      setEndPoint(endPoint);

      if (onSelectionChange && shouldInteract(sourceEvent)) {
        onSelectionChange({ startPoint, endPoint });
      }
    },
    [
      startPoint,
      worldToData,
      camera,
      setEndPoint,
      onSelectionChange,
      shouldInteract,
    ]
  );

  const onPointerUp = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!startPoint) {
        return;
      }

      const { sourceEvent, worldPt } = evt;
      const { target, pointerId } = sourceEvent;
      (target as Element).releasePointerCapture(pointerId);

      setStartPoint(undefined);
      setEndPoint(undefined);

      if (onSelectionEnd && shouldInteract(sourceEvent)) {
        onSelectionEnd({
          startPoint,
          endPoint: worldToData(boundPointToFOV(worldPt, camera)),
        });
      }
    },
    [
      startPoint,
      setEndPoint,
      onSelectionEnd,
      shouldInteract,
      worldToData,
      camera,
    ]
  );

  useCanvasEvents({ onPointerDown, onPointerMove, onPointerUp });

  useKeyboardEvent(
    'Escape',
    () => {
      setStartPoint(undefined);
      setEndPoint(undefined);
    },
    [],
    { event: 'keydown' }
  );

  if (!startPoint || !endPoint || !isModifierKeyPressed) {
    return null;
  }

  return children({ startPoint, endPoint });
}

export type { Props as SelectionProps };
export { SelectionTool as default };
