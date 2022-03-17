import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import { useCanvasEvents, useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
}

function XAxisZoom(props: Props) {
  const { disabled } = props;

  const { shouldInteract } = useAxisSystemContext();

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: shouldInteract('XAxisZoom', sourceEvent),
    y: false,
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed, disabled) });

  return null;
}

export default XAxisZoom;
