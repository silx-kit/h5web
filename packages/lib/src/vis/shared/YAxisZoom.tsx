import type { ModifierKey } from '../models';
import { useCanvasEvents, useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
  modifierKey?: ModifierKey;
}

function YAxisZoom(props: Props) {
  const { disabled, modifierKey = 'Shift' } = props;

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: false,
    y: sourceEvent.getModifierState(modifierKey),
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed, disabled) });

  return null;
}

export default YAxisZoom;
