import type { ModifierKey } from '../models';
import { noModifierKeyPressed } from '../utils';
import InteractionMesh from './InteractionMesh';
import { useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
  modifierKey?: ModifierKey;
}

function ZoomMesh(props: Props) {
  const { disabled, modifierKey } = props;

  const isZoomAllowed = (sourceEvent: WheelEvent) => {
    const shouldZoom = modifierKey
      ? sourceEvent.getModifierState(modifierKey)
      : noModifierKeyPressed(sourceEvent);

    return { x: shouldZoom, y: shouldZoom };
  };

  const onWheel = useZoomOnWheel(isZoomAllowed, disabled);

  return <InteractionMesh onWheel={onWheel} />;
}

export default ZoomMesh;
