import { useCanvasEvents, useZoomOnWheel, useInteraction } from './hooks';
import type { Interaction } from './models';

function Zoom(props: Omit<Interaction, 'button'>) {
  const shouldInteract = useInteraction('Zoom', props);

  const isZoomAllowed = (sourceEvent: WheelEvent) => {
    const shouldZoom = shouldInteract(sourceEvent);

    return { x: shouldZoom, y: shouldZoom };
  };

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export default Zoom;
