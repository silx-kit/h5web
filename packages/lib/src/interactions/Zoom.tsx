import { useCanvasEvents, useZoomOnWheel, useInteraction } from './hooks';
import type { WheelInteraction } from './models';
import { getModifierKeyArray } from './utils';

function Zoom(props: WheelInteraction) {
  const { modifierKey, disabled } = props;
  const shouldInteract = useInteraction('Zoom', {
    modifierKeys: getModifierKeyArray(modifierKey),
    disabled,
    button: 'Wheel',
  });

  const isZoomAllowed = (sourceEvent: WheelEvent) => {
    const shouldZoom = shouldInteract(sourceEvent);

    return { x: shouldZoom, y: shouldZoom };
  };

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export default Zoom;
