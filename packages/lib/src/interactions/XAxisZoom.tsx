import {
  useCanvasEvents,
  useRegisterInteraction,
  useZoomOnWheel,
} from './hooks';
import type { Interaction } from './models';

function XAxisZoom(props: Interaction) {
  const shouldInteract = useRegisterInteraction('XAxisZoom', props);

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: shouldInteract(sourceEvent),
    y: false,
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export default XAxisZoom;
