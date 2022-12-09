import { assertDefined } from '@h5web/shared';
import { useKeyboardEvent, useRafState, useSyncedRef } from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { useCallback, useEffect } from 'react';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import {
  useCanvasEvents,
  useInteraction,
  useModifierKeyPressed,
} from './hooks';
import type { CanvasEvent, CommonInteractionProps, Selection } from './models';
import { MouseButton } from './models';
import { boundWorldPointToFOV, getModifierKeyArray } from './utils';

interface Props extends CommonInteractionProps {
  id?: string;
  transformSelection?: (selection: Selection) => Selection;
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
    transformSelection = (selection) => selection,
    onSelectionStart,
    onSelectionChange,
    onSelectionEnd,
    children,
  } = props;

  // Wrap callbacks in up-to-date but stable refs so consumers don't have to memoise them
  const transformSelectionRef = useSyncedRef(transformSelection);
  const onSelectionStartRef = useSyncedRef(onSelectionStart);
  const onSelectionChangeRef = useSyncedRef(onSelectionChange);
  const onSelectionEndRef = useSyncedRef(onSelectionEnd);

  const camera = useThree((state) => state.camera);
  const { worldToData } = useVisCanvasContext();

  const startEvtRef = useRef<CanvasEvent<PointerEvent>>();
  const [selection, setSelection] = useRafState<Selection>();

  const modifierKeys = getModifierKeyArray(modifierKey);
  const isModifierKeyPressed = useModifierKeyPressed(modifierKeys);

  const shouldInteract = useInteraction(id, {
    button: MouseButton.Left,
    modifierKeys,
    disabled,
  });

  const computeSelection = useCallback(
    (evt: CanvasEvent<PointerEvent>): Selection => {
      assertDefined(startEvtRef.current);
      const { dataPt: dataStart, worldPt: worldStart } = startEvtRef.current;

      const { worldPt: worldEnd } = evt;
      const boundWorldEnd = boundWorldPointToFOV(worldEnd, camera);

      return transformSelectionRef.current({
        world: [worldStart, boundWorldEnd],
        data: [dataStart, worldToData(boundWorldEnd)],
      });
    },
    [camera, transformSelectionRef, worldToData]
  );

  const onPointerDown = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { sourceEvent } = evt;
      if (!shouldInteract(sourceEvent)) {
        return;
      }

      const { target, pointerId } = sourceEvent;
      (target as Element).setPointerCapture(pointerId);
      startEvtRef.current = evt;

      onSelectionStartRef.current?.(evt);
    },
    [onSelectionStartRef, shouldInteract]
  );

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (startEvtRef.current) {
        setSelection(computeSelection(evt));
      }
    },
    [setSelection, computeSelection]
  );

  const onPointerUp = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!startEvtRef.current) {
        return;
      }

      const { sourceEvent } = evt;
      const { target, pointerId } = sourceEvent;
      (target as Element).releasePointerCapture(pointerId);

      if (onSelectionEndRef.current && shouldInteract(sourceEvent)) {
        onSelectionEndRef.current(computeSelection(evt));
      }

      startEvtRef.current = undefined;
      setSelection(undefined);
    },
    [onSelectionEndRef, setSelection, shouldInteract, computeSelection]
  );

  useCanvasEvents({ onPointerDown, onPointerMove, onPointerUp });

  useKeyboardEvent(
    'Escape',
    () => {
      startEvtRef.current = undefined;
      setSelection(undefined);
    },
    [],
    { event: 'keydown' }
  );

  useEffect(() => {
    if (selection && isModifierKeyPressed) {
      onSelectionChangeRef.current?.(selection);
    }
  }, [selection, isModifierKeyPressed, onSelectionChangeRef]);

  if (!selection || !isModifierKeyPressed) {
    return null;
  }

  return <>{children(selection)}</>;
}

export type { Props as SelectionProps };
export { SelectionTool as default };
