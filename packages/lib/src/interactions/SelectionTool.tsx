import { useKeyboardEvent, useToggle, useRafState } from '@react-hookz/web';
import { useThree } from '@react-three/fiber';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { Vector2 } from 'three';

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
  const shouldInteract = useRegisterInteraction(id, { modifierKey, disabled });

  const [startPoint, setStartPoint] = useState<Vector2>();
  const [endPoint, setEndPoint] = useRafState<Vector2 | undefined>(undefined);
  const [isVisible, toggleVisible] = useToggle(true);

  const onPointerDown = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { unprojectedPoint, sourceEvent } = evt;
      if (!shouldInteract(sourceEvent)) {
        return;
      }

      const { target, pointerId } = sourceEvent;
      (target as Element).setPointerCapture(pointerId);
      setStartPoint(worldToData(unprojectedPoint));

      if (onSelectionStart) {
        onSelectionStart();
      }
    },
    [onSelectionStart, shouldInteract, worldToData]
  );

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      if (!startPoint) {
        return;
      }

      const { unprojectedPoint, sourceEvent } = evt;
      const point = worldToData(boundPointToFOV(unprojectedPoint, camera));
      setEndPoint(point);

      if (onSelectionChange && shouldInteract(sourceEvent)) {
        onSelectionChange({
          startPoint,
          endPoint: point,
        });
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

      const { sourceEvent, unprojectedPoint } = evt;
      const { target, pointerId } = sourceEvent;
      (target as Element).releasePointerCapture(pointerId);

      setStartPoint(undefined);
      setEndPoint(undefined);

      if (onSelectionEnd && shouldInteract(sourceEvent)) {
        onSelectionEnd({
          startPoint,
          endPoint: worldToData(boundPointToFOV(unprojectedPoint, camera)),
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

  if (!startPoint || !endPoint || !isVisible) {
    return null;
  }

  return children({ startPoint, endPoint });
}

export type { Props as SelectionProps };
export { SelectionTool as default };
