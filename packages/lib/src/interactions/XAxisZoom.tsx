import { useCanvasEvents, useInteraction, useZoomOnWheel } from './hooks';
import type { Interaction } from './models';

function XAxisZoom(props: Omit<Interaction, 'button'>) {
  const shouldInteract = useInteraction('XAxisZoom', props);

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: shouldInteract(sourceEvent),
    y: false,
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export default XAxisZoom;
