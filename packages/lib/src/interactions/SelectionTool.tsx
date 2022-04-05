import { useKeyboardEvent, useToggle, useRafState } from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import { Vector2 } from 'three';

import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import { useCanvasEvents, useRegisterInteraction } from './hooks';
import type { CanvasEvent, Interaction, Selection } from './models';
import { boundPointToFOV } from './utils';

interface Props extends Interaction {
  onSelectionStart?: () => void;
  onSelectionChange?: (points: Selection) => void;
  onSelectionEnd?: (points: Selection) => void;
  id?: string;
  children: (points: Selection) => ReactElement;
  clampCenter?: boolean;
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
    clampCenter,
  } = props;

  const camera = useThree((state) => state.camera);
  const { worldToData } = useAxisSystemContext();
  const shouldInteract = useRegisterInteraction(id, { modifierKey, disabled });

  const [originPoint, setOriginPoint] = useState<Vector2>();
  const [selection, setSelection] = useRafState<Selection | undefined>(
    undefined
  );
  const [isVisible, toggleVisible] = useToggle(true);

  const getWorldStartPoint = useCallback(
    (originPoint: Vector2, endPoint: Vector2) => {
      if (!clampCenter) {
        return originPoint.clone();
      }
      // Make origin the center of the rectangle
      const delta = originPoint.clone().sub(endPoint);
      return originPoint.clone().add(delta);
    },
    [clampCenter]
  );

  const onPointerDown = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { unprojectedPoint, sourceEvent } = evt;
      if (!shouldInteract(sourceEvent)) {
        return;
      }

      const { target, pointerId } = sourceEvent;
      (target as Element).setPointerCapture(pointerId);
      setSelection({
        startPoint: worldToData(unprojectedPoint),
        endPoint: worldToData(unprojectedPoint),
      });
      setOriginPoint(new Vector2(unprojectedPoint.x, unprojectedPoint.y));

      if (onSelectionStart) {
        onSelectionStart();
      }
    },
    [onSelectionStart, setSelection, shouldInteract, worldToData]
  );

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!originPoint) {
        return;
      }

      const { unprojectedPoint, sourceEvent } = evt;
      const worldEndPoint = new Vector2(unprojectedPoint.x, unprojectedPoint.y);
      const worldStartPoint = getWorldStartPoint(originPoint, worldEndPoint);
      const selection = {
        startPoint: worldToData(boundPointToFOV(worldStartPoint, camera)),
        endPoint: worldToData(boundPointToFOV(worldEndPoint, camera)),
      };
      setSelection(selection);

      if (onSelectionChange && shouldInteract(sourceEvent)) {
        onSelectionChange(selection);
      }
    },
    [
      originPoint,
      getWorldStartPoint,
      worldToData,
      camera,
      setSelection,
      onSelectionChange,
      shouldInteract,
    ]
  );

  const onPointerUp = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!originPoint) {
        return;
      }

      const { sourceEvent, unprojectedPoint } = evt;
      const { target, pointerId } = sourceEvent;
      (target as Element).releasePointerCapture(pointerId);

      const worldEndPoint = new Vector2(unprojectedPoint.x, unprojectedPoint.y);
      const worldStartPoint = getWorldStartPoint(originPoint, worldEndPoint);
      const selection = {
        startPoint: worldToData(boundPointToFOV(worldStartPoint, camera)),
        endPoint: worldToData(boundPointToFOV(worldEndPoint, camera)),
      };

      setSelection(undefined);
      setOriginPoint(undefined);

      if (onSelectionEnd && shouldInteract(sourceEvent)) {
        onSelectionEnd(selection);
      }
    },
    [
      originPoint,
      getWorldStartPoint,
      worldToData,
      camera,
      setSelection,
      onSelectionEnd,
      shouldInteract,
    ]
  );

  useCanvasEvents({ onPointerDown, onPointerMove, onPointerUp });

  useKeyboardEvent(modifierKey, () => toggleVisible(), [], { event: 'keyup' });
  useKeyboardEvent(
    modifierKey,
    () => {
      if (!isVisible) {
        toggleVisible();
      }
    },
    [],
    { event: 'keydown' }
  );
  useKeyboardEvent(
    'Escape',
    () => {
      setSelection(undefined);
      setOriginPoint(undefined);
    },
    [],
    { event: 'keydown' }
  );

  if (!selection || !isVisible) {
    return null;
  }

  return children(selection);
}

export type { Props as SelectionProps };
export { SelectionTool as default };
