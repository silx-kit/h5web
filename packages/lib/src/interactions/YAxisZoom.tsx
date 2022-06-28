import { useCanvasEvents, useZoomOnWheel, useInteraction } from './hooks';
import type { CommonInteractionProps } from './models';
import { getModifierKeyArray } from './utils';

type Props = CommonInteractionProps;

function YAxisZoom(props: Props) {
  const { modifierKey, disabled } = props;
  const shouldInteract = useInteraction('YAxisZoom', {
    modifierKeys: getModifierKeyArray(modifierKey),
    disabled,
    button: 'Wheel',
  });

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: false,
    y: shouldInteract(sourceEvent),
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed) });

  return null;
}

export type { Props as YAxisZoomProps };
export default YAxisZoom;
