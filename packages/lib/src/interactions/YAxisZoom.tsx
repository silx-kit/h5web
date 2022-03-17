import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import { useCanvasEvents, useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
}

function YAxisZoom(props: Props) {
  const { disabled } = props;
  const { shouldInteract } = useAxisSystemContext();

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: false,
    y: shouldInteract('YAxisZoom', sourceEvent),
  });

  useCanvasEvents({ onWheel: useZoomOnWheel(isZoomAllowed, disabled) });

  return null;
}

export default YAxisZoom;
