import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import { useCanvasEvents, useZoomOnWheel } from './hooks';

function YAxisZoom() {
  const { shouldInteract } = useAxisSystemContext();

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: false,
    y: shouldInteract('YAxisZoom', sourceEvent),
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export default YAxisZoom;
