import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import { useCanvasEvents, useZoomOnWheel } from './hooks';

function XAxisZoom() {
  const { shouldInteract } = useAxisSystemContext();

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: shouldInteract('XAxisZoom', sourceEvent),
    y: false,
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export default XAxisZoom;
