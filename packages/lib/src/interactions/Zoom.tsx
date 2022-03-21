import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import { useCanvasEvents, useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
}

function Zoom(props: Props) {
  const { disabled } = props;
  const { shouldInteract } = useAxisSystemContext();

  const isZoomAllowed = (sourceEvent: WheelEvent) => {
    const shouldZoom = shouldInteract('Zoom', sourceEvent);

    return { x: shouldZoom, y: shouldZoom };
  };

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed, disabled) });

  return null;
}

export default Zoom;
