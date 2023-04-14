import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import { useCanvasEvents, useInteraction, useZoomOnWheel } from './hooks';
import { type CommonInteractionProps } from './models';
import { getModifierKeyArray } from './utils';

type Props = CommonInteractionProps;

function YAxisZoom(props: Props) {
  const { modifierKey, disabled } = props;
  const { visRatio } = useVisCanvasContext();

  const shouldInteract = useInteraction('YAxisZoom', {
    modifierKeys: getModifierKeyArray(modifierKey),
    disabled: visRatio !== undefined || disabled,
    button: 'Wheel',
  });

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: false,
    y: shouldInteract(sourceEvent),
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export { type Props as YAxisZoomProps };
export default YAxisZoom;
