import { useCanvasEvents, useInteraction, useZoomOnWheel } from './hooks';
import type { WheelInteraction } from './models';
import { getModifierKeyArray } from './utils';

function XAxisZoom(props: WheelInteraction) {
  const { modifierKey, disabled } = props;
  const shouldInteract = useInteraction('XAxisZoom', {
    modifierKeys: getModifierKeyArray(modifierKey),
    disabled,
    button: 'Wheel',
  });

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: shouldInteract(sourceEvent),
    y: false,
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export default XAxisZoom;
