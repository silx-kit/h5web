import {
  useKeyboardEvent,
  usePrevious,
  useRafState,
  useSyncedRef,
} from '@react-hookz/web';
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
  onSelectionStart?: (selection: Selection) => void;
  onSelectionChange?: (selection: Selection | undefined) => void;
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
  const hasSuccessfullyEndedRef = useRef<boolean>(false);

  const [selection, setSelection] = useRafState<Selection>();
  const prevSelection = usePrevious(selection);

  const modifierKeys = getModifierKeyArray(modifierKey);
  const isModifierKeyPressed = useModifierKeyPressed(modifierKeys);

  const shouldInteract = useInteraction(id, {
    button: MouseButton.Left,
    modifierKeys,
    disabled,
  });

  const onPointerDown = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { sourceEvent } = evt;
      if (!shouldInteract(sourceEvent)) {
        return;
      }

      const { target, pointerId } = sourceEvent;
      (target as Element).setPointerCapture(pointerId);

      startEvtRef.current = evt;
    },
    [shouldInteract]
  );

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!startEvtRef.current) {
        return;
      }

      const { dataPt: dataStart, worldPt: worldStart } = startEvtRef.current;
      const { worldPt: worldEnd } = evt;
      const boundWorldEnd = boundWorldPointToFOV(worldEnd, camera);

      setSelection(
        transformSelectionRef.current({
          world: [worldStart, boundWorldEnd],
          data: [dataStart, worldToData(boundWorldEnd)],
        })
      );
    },
    [camera, transformSelectionRef, setSelection, worldToData]
  );

  const onPointerUp = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!startEvtRef.current) {
        return;
      }

      const { sourceEvent } = evt;
      const { target, pointerId } = sourceEvent;
      (target as Element).releasePointerCapture(pointerId);

      startEvtRef.current = undefined;
      hasSuccessfullyEndedRef.current = shouldInteract(sourceEvent);
      setSelection(undefined);
    },
    [setSelection, shouldInteract]
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
    // Selection state is now defined => selection has started
    if (!prevSelection && selection) {
      onSelectionStartRef.current?.(selection);
      return;
    }

    /* Selection state is now undefined => selection has ended.
     * Invoke callback but only if the selection has ended successfully - i.e. if:
     * - the selection was not cancelled with Escape,
     * - and the modifier key was not released before the pointer. */
    if (prevSelection && !selection && hasSuccessfullyEndedRef.current) {
      hasSuccessfullyEndedRef.current = false;
      onSelectionEndRef.current?.(prevSelection);
      return;
    }

    // Selection remains defined => selection has changed
    if (prevSelection && selection) {
      onSelectionChangeRef.current?.(
        isModifierKeyPressed ? selection : undefined // don't pass selection object if user is not pressing modifier key
      );
    }
  }, [
    prevSelection,
    selection,
    isModifierKeyPressed,
    onSelectionChangeRef,
    onSelectionStartRef,
    onSelectionEndRef,
  ]);

  if (!selection || !isModifierKeyPressed) {
    return null;
  }

  return <>{children(selection)}</>;
}

export type { Props as SelectionToolProps };
export { SelectionTool as default };
