import type { ModifierKey } from '../models';
import { useCanvasEvents, useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
  modifierKey?: ModifierKey;
}

function XAxisZoom(props: Props) {
  const { disabled, modifierKey = 'Alt' } = props;

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: sourceEvent.getModifierState(modifierKey),
    y: false,
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed, disabled) });

  return null;
}

export default XAxisZoom;
