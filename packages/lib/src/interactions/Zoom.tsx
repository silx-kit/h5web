import { useCanvasEvents, useInteraction, useZoomOnWheel } from './hooks';
import type { CommonInteractionProps } from './models';
import { getModifierKeyArray } from './utils';

type Props = CommonInteractionProps;

function Zoom(props: Props) {
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

export type { Props as ZoomProps };
export default Zoom;
