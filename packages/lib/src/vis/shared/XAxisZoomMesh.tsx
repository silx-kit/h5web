import type { ModifierKey } from '../models';
import InteractionMesh from './InteractionMesh';
import { useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
  modifierKey?: ModifierKey;
}

function XAxisZoomMesh(props: Props) {
  const { disabled, modifierKey = 'Alt' } = props;

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: sourceEvent.getModifierState(modifierKey),
    y: false,
  });

  const onWheel = useZoomOnWheel(isZoomAllowed, disabled);

  return <InteractionMesh onWheel={onWheel} />;
}

export default XAxisZoomMesh;
