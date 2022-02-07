import type { ModifierKey } from '../models';
import InteractionMesh from './InteractionMesh';
import { useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
  modifierKey?: ModifierKey;
}

function YAxisZoomMesh(props: Props) {
  const { disabled, modifierKey = 'Shift' } = props;

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: false,
    y: sourceEvent.getModifierState(modifierKey),
  });

  const onWheel = useZoomOnWheel(isZoomAllowed, disabled);

  return <InteractionMesh onWheel={onWheel} />;
}

export default YAxisZoomMesh;
