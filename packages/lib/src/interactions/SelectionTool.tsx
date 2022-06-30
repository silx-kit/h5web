import { useKeyboardEvent, useRafState } from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { Vector2 } from 'three';

import { useAxisSystemContext } from '../vis/shared/AxisSystemProvider';
import {
  useCanvasEvents,
  useInteraction,
  useModifierKeyPressed,
} from './hooks';
import type { CanvasEvent, CommonInteractionProps, Selection } from './models';
import { MouseButton } from './models';
import { boundPointToFOV, getModifierKeyArray } from './utils';

interface Props extends CommonInteractionProps {
  id?: string;
  onSelectionStart?: () => void;
  onSelectionChange?: (points: Selection) => void;
  onSelectionEnd?: (points: Selection) => void;
  children: (points: Selection) => ReactElement;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function SelectionTool(props: Props) {
  const {
    id = 'Selection',
    modifierKey,
    disabled,
    onSelectionStart,
    onSelectionChange,
    onSelectionEnd,
    children,
  } = props;

  const camera = useThree((state) => state.camera);
  const { dataToWorld, worldToData } = useAxisSystemContext();
  const modifierKeys = getModifierKeyArray(modifierKey);

  const shouldInteract = useInteraction(id, {
    button: MouseButton.Left,
    modifierKeys,
    disabled,
  });

  const [startPoint, setStartPoint] = useState<Vector2>();
  const [endPoint, setEndPoint] = useRafState<Vector2 | undefined>(undefined);
  const isModifierKeyPressed = useModifierKeyPressed(modifierKeys);

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
      const dataEndPoint = worldToData(boundPointToFOV(worldPt, camera));
      setEndPoint(dataEndPoint);

      const worldEndPoint = dataToWorld(dataEndPoint);
      const worldStartPoint = dataToWorld(startPoint);

      if (onSelectionChange && shouldInteract(sourceEvent)) {
        onSelectionChange({
          startPoint,
          endPoint: dataEndPoint,
          worldStartPoint,
          worldEndPoint,
        });
      }
    },
    [
      startPoint,
      worldToData,
      camera,
      setEndPoint,
      dataToWorld,
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
        const dataEndPoint = worldToData(boundPointToFOV(worldPt, camera));
        const worldEndPoint = dataToWorld(dataEndPoint);
        const worldStartPoint = dataToWorld(startPoint);

        onSelectionEnd({
          startPoint,
          endPoint: dataEndPoint,
          worldStartPoint,
          worldEndPoint,
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
      dataToWorld,
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

  const worldEndPoint = dataToWorld(endPoint);
  const worldStartPoint = dataToWorld(startPoint);

  return children({
    startPoint,
    endPoint,
    worldStartPoint,
    worldEndPoint,
  });
}

export type { Props as SelectionProps };
export { SelectionTool as default };
