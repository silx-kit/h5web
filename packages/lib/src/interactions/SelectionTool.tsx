import { assertDefined } from '@h5web/shared';
import { useKeyboardEvent, useRafState } from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { Vector3 } from 'three';

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
  onSelectionStart?: (evt: CanvasEvent<PointerEvent>) => void;
  onSelectionChange?: (selection: Selection) => void;
  onSelectionEnd?: (selection: Selection) => void;
  children: (selection: Selection) => ReactNode;
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
  const { worldToData } = useVisCanvasContext();

  const [startEvt, setStartEvt] = useState<CanvasEvent<PointerEvent>>();
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

  const computeSelection = useCallback(
    (worldEndPt: Vector3) => {
      assertDefined(startEvt);
      const { dataPt: startPoint, worldPt: worldStartPoint } = startEvt;
      const boundWorldEndPoint = boundPointToFOV(worldEndPt, camera);

      return {
        startPoint,
        endPoint: worldToData(boundWorldEndPoint),
        worldStartPoint,
        worldEndPoint: boundWorldEndPoint,
      };
    },
    [camera, startEvt, worldToData]
  );

  const onPointerDown = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { sourceEvent } = evt;
      if (!shouldInteract(sourceEvent)) {
        return;
      }

      const { target, pointerId } = sourceEvent;
      (target as Element).setPointerCapture(pointerId);

      setStartEvt(evt);

      if (onSelectionStart) {
        onSelectionStart(evt);
      }
    },
    [onSelectionStart, shouldInteract]
  );

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (startEvt) {
        setSelection(computeSelection(evt.worldPt));
      }
    },
    [startEvt, setSelection, computeSelection]
  );

  const onPointerUp = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!startEvt) {
        return;
      }

      const { sourceEvent, worldPt } = evt;
      const { target, pointerId } = sourceEvent;
      (target as Element).releasePointerCapture(pointerId);

      setStartEvt(undefined);
      setSelection(undefined);

      if (onSelectionEnd && shouldInteract(sourceEvent)) {
        onSelectionEnd(computeSelection(worldPt));
      }
    },
    [startEvt, setSelection, onSelectionEnd, shouldInteract, computeSelection]
  );

  useCanvasEvents({ onPointerDown, onPointerMove, onPointerUp });

  useKeyboardEvent(
    'Escape',
    () => {
      setStartEvt(undefined);
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
