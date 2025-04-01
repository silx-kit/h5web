import { assertDefined } from '@h5web/shared/guards';
import {
  useEventListener,
  useKeyboardEvent,
  usePrevious,
  useRafState,
  useSyncedRef,
} from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { type Camera, type Vector3 } from 'three';

import {
  useVisCanvasContext,
  type VisCanvasContextValue,
} from '../vis/shared/VisCanvasProvider';
import { useCanvasEvent, useInteraction, useModifierKeyPressed } from './hooks';
import {
  type CanvasEvent,
  type CommonInteractionProps,
  MouseButton,
  type Rect,
  type Selection,
} from './models';

interface Props extends CommonInteractionProps {
  id?: string;
  transform?: (
    rawSelection: Selection,
    camera: Camera,
    context: VisCanvasContextValue,
  ) => Selection;
  validate?: (selection: Selection) => boolean;
  onSelectionStart?: () => void;
  onSelectionChange?: (
    selection: Selection | undefined,
    rawSelection: Selection,
    isValid: boolean,
  ) => void;
  onSelectionEnd?: (selection: Selection | undefined, isValid: boolean) => void;
  onValidSelection?: (selection: Selection) => void;
  children: (
    selection: Selection,
    rawSelection: Selection,
    isValid: boolean,
  ) => ReactNode;
}

function SelectionTool(props: Props) {
  const {
    id = 'Selection',
    modifierKey,
    disabled,
    transform = (selection) => selection,
    validate = () => true,
    onSelectionStart,
    onSelectionChange,
    onSelectionEnd,
    onValidSelection,
    children,
  } = props;

  // Wrap callbacks in up-to-date but stable refs so consumers don't have to memoise them
  const transformRef = useSyncedRef(transform);
  const validateRef = useSyncedRef(validate);
  const onSelectionStartRef = useSyncedRef(onSelectionStart);
  const onSelectionChangeRef = useSyncedRef(onSelectionChange);
  const onSelectionEndRef = useSyncedRef(onSelectionEnd);
  const onValidSelectionRef = useSyncedRef(onValidSelection);

  const camera = useThree((state) => state.camera);
  const context = useVisCanvasContext();
  const { canvasBox, htmlToWorld, worldToData } = context;

  const [rawSelection, setRawSelection] = useRafState<Selection>();
  const startEvtRef = useRef<CanvasEvent<PointerEvent>>();
  const hasSuccessfullyEndedRef = useRef<boolean>(false);

  const isModifierKeyPressed = useModifierKeyPressed(modifierKey);

  const shouldInteract = useInteraction(id, {
    button: MouseButton.Left,
    modifierKey,
    disabled,
  });

  function computeRawSelection(
    htmlStart: Vector3,
    htmlEnd = htmlStart,
  ): Selection {
    const html: Rect = [htmlStart, canvasBox.clampPoint(htmlEnd)];
    const world = html.map((pt) => htmlToWorld(camera, pt)) as Rect;
    const data = world.map(worldToData) as Rect;
    return { html, world, data };
  }

  function handlePointerDown(evt: CanvasEvent<PointerEvent>) {
    const { sourceEvent, htmlPt } = evt;
    if (!shouldInteract(sourceEvent)) {
      return;
    }

    const { target, pointerId } = sourceEvent;
    (target as Element).setPointerCapture(pointerId);

    startEvtRef.current = evt;
    setRawSelection(computeRawSelection(htmlPt));
  }

  function handlePointerMove(evt: CanvasEvent<PointerEvent>) {
    const { current: startEvt } = startEvtRef;
    if (!startEvt) {
      return;
    }

    setRawSelection(computeRawSelection(startEvt.htmlPt, evt.htmlPt));
  }

  function handlePointerUp(evt: CanvasEvent<PointerEvent>) {
    if (!startEvtRef.current) {
      return;
    }

    const { sourceEvent } = evt;
    const { target, pointerId } = sourceEvent;
    (target as Element).releasePointerCapture(pointerId);

    startEvtRef.current = undefined;
    hasSuccessfullyEndedRef.current = shouldInteract(sourceEvent);
    setRawSelection(undefined);
  }

  useCanvasEvent('pointerdown', handlePointerDown);
  useCanvasEvent('pointermove', handlePointerMove);
  useCanvasEvent('pointerup', handlePointerUp);

  function cancelSelection() {
    startEvtRef.current = undefined;
    setRawSelection(undefined);
  }

  useKeyboardEvent('Escape', cancelSelection, [], { event: 'keydown' });
  useEventListener(globalThis, 'contextmenu', (evt: MouseEvent) => {
    if (startEvtRef.current) {
      evt.preventDefault();
      cancelSelection();
    }
  });

  // Compute effective selection
  const selection = useMemo(
    () => rawSelection && transformRef.current(rawSelection, camera, context),
    [rawSelection, transformRef, camera, context],
  );

  // Determine if effective selection respects the minimum size threshold
  const isValid = useMemo(
    () => !!selection && validateRef.current(selection),
    [selection, validateRef],
  );

  // Keep track of previous effective selection and validity
  const prevSelection = usePrevious(selection);
  const prevIsValid = usePrevious(isValid);

  useEffect(() => {
    if (selection) {
      assertDefined(rawSelection);

      // Previous selection was undefined and current selection is now defined => selection has started
      if (!prevSelection) {
        onSelectionStartRef.current?.();
      }

      // Either way, current selection is defined, so invoke change callback with effective selection object
      onSelectionChangeRef.current?.(
        isModifierKeyPressed ? selection : undefined, // don't pass selection object if user is not pressing modifier key
        rawSelection,
        isValid,
      );

      return;
    }

    // Previous selection was defined and current selection is now undefined => selection has ended.
    if (prevSelection) {
      assertDefined(prevIsValid);
      onSelectionEndRef.current?.(
        hasSuccessfullyEndedRef.current ? prevSelection : undefined, // pass `undefined` if Escape pressed or modifier key released
        prevIsValid,
      );

      if (prevIsValid && hasSuccessfullyEndedRef.current) {
        onValidSelectionRef.current?.(prevSelection);
      }

      hasSuccessfullyEndedRef.current = false;
    }
  }, [
    selection,
    prevSelection,
    rawSelection,
    isValid,
    prevIsValid,
    isModifierKeyPressed,
    onSelectionStartRef,
    onSelectionChangeRef,
    onSelectionEndRef,
    onValidSelectionRef,
  ]);

  if (!selection || !isModifierKeyPressed) {
    return null;
  }

  assertDefined(rawSelection);
  return children(selection, rawSelection, isValid);
}

export type { Props as SelectionToolProps };
export default SelectionTool;
