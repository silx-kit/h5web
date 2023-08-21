import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import { useCanvasEvents, useInteraction, useZoomOnWheel } from './hooks';
import type { CommonInteractionProps } from './models';

type Props = CommonInteractionProps;

function XAxisZoom(props: Props) {
  const { modifierKey, disabled } = props;
  const { visRatio } = useVisCanvasContext();

  const shouldInteract = useInteraction('XAxisZoom', {
    button: 'Wheel',
    modifierKey,
    disabled: visRatio !== undefined || disabled,
  });

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: shouldInteract(sourceEvent),
    y: false,
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export type { Props as XAxisZoomProps };
export default XAxisZoom;
