import {
  useCanvasEvent,
  useInteraction,
  useWheelCapture,
  useZoomOnWheel,
} from './hooks';
import type { CommonInteractionProps } from './models';

type Props = CommonInteractionProps;

function Zoom(props: Props) {
  const { modifierKey, disabled } = props;
  const shouldInteract = useInteraction('Zoom', {
    button: 'Wheel',
    modifierKey,
    disabled,
  });

  const handleWheel = useZoomOnWheel((sourceEvent: WheelEvent) => {
    const shouldZoom = shouldInteract(sourceEvent);
    return { x: shouldZoom, y: shouldZoom };
  });

  useWheelCapture();
  useCanvasEvent('wheel', handleWheel);

  return null;
}

export type { Props as ZoomProps };
export default Zoom;
