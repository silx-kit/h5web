import { assertDefined } from '@h5web/shared';
import {
  useKeyboardEvent,
  usePrevious,
  useRafState,
  useSyncedRef,
} from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Camera, Vector3 } from 'three';

import type { VisCanvasContextValue } from '../vis/shared/VisCanvasProvider';
import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import {
  useCanvasEvents,
  useInteraction,
  useModifierKeyPressed,
} from './hooks';
import type {
  CanvasEvent,
  CommonInteractionProps,
  Points,
  Selection,
} from './models';
import { MouseButton } from './models';
import { getModifierKeyArray } from './utils';

interface Props extends CommonInteractionProps {
  id?: string;
  /** default = 2, must be >= 1 */
  minPoints?: number;
  /** default to minPoints, must be >= minPoints or -1 = unlimited */
  maxPoints?: number;
  /** max movement between pointer up/down to ignore, default = 1 */
  maxMovement?: number;
  transform?: (
    rawSelection: Selection,
    camera: Camera,
    context: VisCanvasContextValue
  ) => Selection;
  validate?: (selection: Selection) => boolean;
  onSelectionStart?: () => void;
  onSelectionChange?: (
    selection: Selection | undefined,
    rawSelection: Selection,
    isValid: boolean
  ) => void;
  onSelectionEnd?: (selection: Selection | undefined, isValid: boolean) => void;
  onValidSelection?: (selection: Selection) => void;
  children: (
    selection: Selection,
    rawSelection: Selection,
    isValid: boolean,
    isComple: boolean
  ) => ReactNode;
}

function SelectionTool(props: Props) {
  const {
    id = 'Selection',
    minPoints = 2,
    maxPoints = minPoints,
    maxMovement = 1,
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

  if (minPoints < 1) {
    throw new RangeError(`minPoints must be >= 1, ${minPoints}`);
  }

  if (maxPoints < minPoints && maxPoints !== -1) {
    throw new RangeError(
      `maxPoints must be -1 or >= minPoints, ${maxPoints} cf ${minPoints}`
    );
  }

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
  const currentPtsRef = useRef<Vector3[]>();
  const useNewPointRef = useRef<boolean>(true);
  const isCompleteRef = useRef<boolean>(false);
  const hasSuccessfullyEndedRef = useRef<boolean>(false);

  const modifierKeys = getModifierKeyArray(modifierKey);
  const isModifierKeyPressed = useModifierKeyPressed(modifierKeys);

  const shouldInteract = useInteraction(id, {
    button: MouseButton.Left,
    modifierKeys,
    disabled,
  });

  const setPoints = useCallback(
    (html: Vector3[]) => {
      const world = html.map((pt) => htmlToWorld(camera, pt)) as Points;
      const data = world.map(worldToData) as Points;
      setRawSelection({ html, world, data });
    },
    [camera, htmlToWorld, setRawSelection, worldToData]
  );

  const startSelection = useCallback(
    (eTarget: Element, pointerId: number, point: Vector3) => {
      if (!useNewPointRef.current) {
        useNewPointRef.current = true;
      } else {
        currentPtsRef.current = [point];
        isCompleteRef.current = false;
        eTarget.setPointerCapture(pointerId);
        if (maxPoints === 1) {
          // no pointer movement necessary for single point
          setPoints([point]);
        }
      }
    },
    [maxPoints, setPoints]
  );

  const finishSelection = useCallback(
    (
      eTarget: Element,
      pointerId: number,
      isDown: boolean,
      interact: boolean
    ) => {
      eTarget.releasePointerCapture(pointerId);
      useNewPointRef.current = !isDown; // so up is ignored
      hasSuccessfullyEndedRef.current = interact;
      currentPtsRef.current = undefined;
    },
    []
  );

  const onPointerClick = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { sourceEvent } = evt;
      const isDown = sourceEvent.type === 'pointerdown';
      const doInteract = shouldInteract(sourceEvent);
      if (isDown && !doInteract) {
        return;
      }

      const { target, pointerId } = sourceEvent;
      const eTarget = target as Element;

      const pts = currentPtsRef.current;
      const cPt = canvasBox.clampPoint(evt.htmlPt);
      if (pts === undefined) {
        startSelection(eTarget, pointerId, cPt);
        return;
      }
      const nPts = pts.length;
      let done = false;
      if (useNewPointRef.current) {
        const lPt = pts[nPts - 1];
        const absMovement =
          nPts === 1
            ? 0
            : Math.max(Math.abs(lPt.x - cPt.x), Math.abs(lPt.y - cPt.y));
        if (absMovement <= maxMovement) {
          // clicking in same spot when complete finishes selection
          done = isDown && isCompleteRef.current;
        } else {
          pts.push(cPt);
          useNewPointRef.current = false;
        }
      } else {
        useNewPointRef.current = true;
      }
      if (done || (nPts >= minPoints && maxPoints > 0 && nPts === maxPoints)) {
        finishSelection(eTarget, pointerId, isDown, doInteract);
      }
    },
    [
      shouldInteract,
      canvasBox,
      minPoints,
      maxPoints,
      maxMovement,
      startSelection,
      finishSelection,
    ]
  );

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const pts = currentPtsRef.current;
      if (pts === undefined) {
        return;
      }

      const nPts = pts.length;
      const cPt = canvasBox.clampPoint(evt.htmlPt);
      if (useNewPointRef.current) {
        pts.push(cPt);
        useNewPointRef.current = false;
      } else {
        pts[nPts - 1] = cPt;
      }
      setPoints([...pts]);
    },
    [canvasBox, setPoints]
  );

  useCanvasEvents({
    onPointerDown: onPointerClick,
    onPointerMove,
    onPointerUp: onPointerClick,
  });

  useKeyboardEvent(
    'Escape',
    () => {
      currentPtsRef.current = undefined;
      setRawSelection(undefined);
    },
    [],
    { event: 'keydown' }
  );

  useKeyboardEvent(
    'Enter',
    () => {
      if (isCompleteRef.current) {
        hasSuccessfullyEndedRef.current = true;
        currentPtsRef.current = undefined;
        setRawSelection(undefined);
      }
    },
    [],
    { event: 'keydown' }
  );

  // Compute effective selection
  const selection = useMemo(
    () => rawSelection && transformRef.current(rawSelection, camera, context),
    [rawSelection, transformRef, camera, context]
  );

  // Determine if effective selection respects the minimum size threshold
  const isValid = useMemo(() => {
    const valid = !!selection && validateRef.current(selection);
    if (valid && selection !== undefined) {
      const nPts = selection?.html.length;
      isCompleteRef.current = nPts >= minPoints;
    }
    return valid;
  }, [isCompleteRef, minPoints, selection, validateRef]);

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
        isValid
      );

      return;
    }

    // Previous selection was defined and current selection is now undefined => selection has ended.
    if (prevSelection) {
      assertDefined(prevIsValid);
      onSelectionEndRef.current?.(
        hasSuccessfullyEndedRef.current ? prevSelection : undefined, // pass `undefined` if Escape pressed or modifier key released
        prevIsValid
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
  return (
    <>{children(selection, rawSelection, isValid, isCompleteRef.current)}</>
  );
}

export type { Props as SelectionToolProps };
export { SelectionTool as default };
