import {
  useCanvasEvents,
  useZoomOnWheel,
  useRegisterInteraction,
} from './hooks';
import type { Interaction } from './models';

function YAxisZoom(props: Interaction) {
  const shouldInteract = useRegisterInteraction('YAxisZoom', props);

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: false,
    y: shouldInteract(sourceEvent),
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export default YAxisZoom;
