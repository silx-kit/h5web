import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import {
  useCanvasEvent,
  useInteraction,
  useWheelCapture,
  useZoomOnWheel,
} from './hooks';
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

  const handleWheel = useZoomOnWheel((sourceEvent: WheelEvent) => ({
    x: shouldInteract(sourceEvent),
    y: false,
  }));

  useWheelCapture();
  useCanvasEvent('wheel', handleWheel);

  return null;
}

export type { Props as XAxisZoomProps };
export default XAxisZoom;
