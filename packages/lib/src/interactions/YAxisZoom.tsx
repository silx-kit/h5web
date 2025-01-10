import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import {
  useCanvasEvent,
  useInteraction,
  useWheelCapture,
  useZoomOnWheel,
} from './hooks';
import type { CommonInteractionProps } from './models';

type Props = CommonInteractionProps;

function YAxisZoom(props: Props) {
  const { modifierKey, disabled } = props;
  const { visRatio } = useVisCanvasContext();

  const shouldInteract = useInteraction('YAxisZoom', {
    button: 'Wheel',
    modifierKey,
    disabled: visRatio !== undefined || disabled,
  });

  const handleWheel = useZoomOnWheel((sourceEvent: WheelEvent) => ({
    x: false,
    y: shouldInteract(sourceEvent),
  }));

  useWheelCapture();
  useCanvasEvent('wheel', handleWheel);

  return null;
}

export type { Props as YAxisZoomProps };
export default YAxisZoom;
