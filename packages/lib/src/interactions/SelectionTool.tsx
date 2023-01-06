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

interface SelectionState {
  selection: Selection | undefined;
  isCancelled?: boolean;
}

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

  const [selectionState, setSelectionState] = useRafState<SelectionState>({
    selection: undefined,
  });

  const prevSelectionState = usePrevious(selectionState);
  const startEvtRef = useRef<CanvasEvent<PointerEvent>>();

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

      setSelectionState({
        selection: transformSelectionRef.current({
          world: [worldStart, boundWorldEnd],
          data: [dataStart, worldToData(boundWorldEnd)],
        }),
      });
    },
    [camera, transformSelectionRef, setSelectionState, worldToData]
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
      setSelectionState({
        selection: undefined,
        isCancelled: !shouldInteract(sourceEvent),
      });
    },
    [setSelectionState, shouldInteract]
  );

  useCanvasEvents({ onPointerDown, onPointerMove, onPointerUp });

  useKeyboardEvent(
    'Escape',
    () => {
      startEvtRef.current = undefined;
      setSelectionState({ selection: undefined, isCancelled: true });
    },
    [],
    { event: 'keydown' }
  );

  useEffect(() => {
    const { selection, isCancelled } = selectionState;

    if (selection) {
      // Previous selection was undefined and current selection is now defined => selection has started
      if (!prevSelectionState?.selection) {
        onSelectionStartRef.current?.(selection);
      }

      // Either way, current selection is defined, so invoke change callback
      onSelectionChangeRef.current?.(
        isModifierKeyPressed ? selection : undefined // don't pass selection object if user is not pressing modifier key
      );

      return;
    }

    /* Previous selection was defined and current selection is now undefined => selection has ended.
     * Invoke callback but only if selection wasn't cancelled. */
    if (prevSelectionState?.selection && !isCancelled) {
      onSelectionEndRef.current?.(prevSelectionState.selection);
    }
  }, [
    prevSelectionState,
    selectionState,
    isModifierKeyPressed,
    onSelectionChangeRef,
    onSelectionStartRef,
    onSelectionEndRef,
  ]);

  const { selection } = selectionState;
  if (!selection || !isModifierKeyPressed) {
    return null;
  }

  return <>{children(selection)}</>;
}

export type { Props as SelectionToolProps };
export { SelectionTool as default };
