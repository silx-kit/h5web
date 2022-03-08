import type { ModifierKey } from '../models';
import { noModifierKeyPressed } from '../utils';
import EventsHelper from './EventsHelper';
import { useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
  modifierKey?: ModifierKey;
}

function ZoomEvents(props: Props) {
  const { disabled, modifierKey } = props;

  const isZoomAllowed = (sourceEvent: WheelEvent) => {
    const shouldZoom = modifierKey
      ? sourceEvent.getModifierState(modifierKey)
      : noModifierKeyPressed(sourceEvent);

    return { x: shouldZoom, y: shouldZoom };
  };

  const onWheel = useZoomOnWheel(isZoomAllowed, disabled);

  return <EventsHelper onWheel={onWheel} />;
}

export default ZoomEvents;
