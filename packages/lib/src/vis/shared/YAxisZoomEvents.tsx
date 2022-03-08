import type { ModifierKey } from '../models';
import EventsHelper from './EventsHelper';
import { useZoomOnWheel } from './hooks';

interface Props {
  disabled?: boolean;
  modifierKey?: ModifierKey;
}

function YAxisZoomEvents(props: Props) {
  const { disabled, modifierKey = 'Shift' } = props;

  const isZoomAllowed = (sourceEvent: WheelEvent) => ({
    x: false,
    y: sourceEvent.getModifierState(modifierKey),
  });

  const onWheel = useZoomOnWheel(isZoomAllowed, disabled);

  return <EventsHelper onWheel={onWheel} />;
}

export default YAxisZoomEvents;
