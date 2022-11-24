import { useKeyboardEvent, useRafState } from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { Vector2 } from 'three';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
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
  children: (points: Selection) => ReactNode;
}

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
  const { dataToWorld, worldToData } = useVisCanvasContext();

  const [startPoint, setStartPoint] = useState<Vector2>();
  const [selection, setSelection] = useRafState<Selection | undefined>(
    undefined
  );

  const modifierKeys = getModifierKeyArray(modifierKey);
  const isModifierKeyPressed = useModifierKeyPressed(modifierKeys);

  const shouldInteract = useInteraction(id, {
    button: MouseButton.Left,
    modifierKeys,
    disabled,
  });

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

      const { worldPt } = evt;
      const dataEndPoint = worldToData(boundPointToFOV(worldPt, camera));

      setSelection({
        startPoint,
        endPoint: dataEndPoint,
        worldStartPoint: dataToWorld(startPoint),
        worldEndPoint: dataToWorld(dataEndPoint),
      });
    },
    [startPoint, worldToData, camera, setSelection, dataToWorld]
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
      setSelection(undefined);

      if (onSelectionEnd && shouldInteract(sourceEvent)) {
        const dataEndPoint = worldToData(boundPointToFOV(worldPt, camera));

        onSelectionEnd({
          startPoint,
          endPoint: dataEndPoint,
          worldStartPoint: dataToWorld(startPoint),
          worldEndPoint: dataToWorld(dataEndPoint),
        });
      }
    },
    [
      startPoint,
      setSelection,
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
      setSelection(undefined);
    },
    [],
    { event: 'keydown' }
  );

  useEffect(() => {
    if (onSelectionChange && selection && isModifierKeyPressed) {
      onSelectionChange(selection);
    }
  }, [selection, isModifierKeyPressed, onSelectionChange]);

  if (!selection || !isModifierKeyPressed) {
    return null;
  }

  return <>{children(selection)}</>;
}

export type { Props as SelectionProps };
export { SelectionTool as default };
