import type { ModifierKey } from '../models';
import EventsHelper from './EventsHelper';
import { useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
  modifierKey?: ModifierKey;
}

function XAxisZoomEvents(props: Props) {
  const { disabled, modifierKey = 'Alt' } = props;

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: sourceEvent.getModifierState(modifierKey),
    y: false,
  });

  const onWheel = useZoomOnWheel(isZoomAllowed, disabled);

  return <EventsHelper onWheel={onWheel} />;
}

export default XAxisZoomEvents;
