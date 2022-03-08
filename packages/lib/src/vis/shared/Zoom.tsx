import type { ModifierKey } from '../models';
import { checkModifierKey } from '../utils';
import { useCanvasEvents, useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
  modifierKey?: ModifierKey;
}

function Zoom(props: Props) {
  const { disabled, modifierKey } = props;

  const isZoomAllowed = (sourceEvent: WheelEvent) => {
    const shouldZoom = checkModifierKey(modifierKey, sourceEvent);

    return { x: shouldZoom, y: shouldZoom };
  };

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed, disabled) });

  return null;
}

export default Zoom;
