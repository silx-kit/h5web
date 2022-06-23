import { useCanvasEvents, useZoomOnWheel, useInteraction } from './hooks';
import type { WheelInteraction } from './models';
import { getModifierKeyArray } from './utils';

function YAxisZoom(props: WheelInteraction) {
  const { modifierKey, disabled } = props;
  const shouldInteract = useInteraction('YAxisZoom', {
    modifierKeys: getModifierKeyArray(modifierKey),
    disabled,
    button: 'Wheel',
  });

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: false,
    y: shouldInteract(sourceEvent),
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export default YAxisZoom;
