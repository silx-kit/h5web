import { assertDefined } from '@h5web/shared';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

import type { InteractionEntry, ModifierKey } from './models';
import type { MouseButton } from './models';

export interface InteractionsContextValue {
  registerInteraction: (id: string, value: InteractionEntry) => void;
  unregisterInteraction: (id: string) => void;
  shouldInteract: (id: string, event: MouseEvent) => boolean;
}

interface MapEntry extends InteractionEntry {
  id: string;
}

const InteractionsContext = createContext({} as InteractionsContextValue);

export function useInteractionsContext() {
  return useContext(InteractionsContext);
}

function InteractionsProvider(props: { children: ReactNode }) {
  const { children } = props;

  const [interactionMap] = useState(new Map<string, MapEntry>());

  const registerInteraction = useCallback(
    (id: string, value: InteractionEntry) => {
      interactionMap.set(id, { id, ...value });
    },
    [interactionMap]
  );

  const unregisterInteraction = useCallback(
    (id: string) => {
      interactionMap.delete(id);
    },
    [interactionMap]
  );

  const shouldInteract = useCallback(
    (interactionId: string, event: MouseEvent | WheelEvent) => {
      const registeredInteractions = [...interactionMap.values()];

      function isButtonPressed(button?: MouseButton | 'Wheel') {
        if (event instanceof WheelEvent) {
          return button === 'Wheel';
        }

        return event.button === button;
      }

      function areKeysPressed(keys: ModifierKey[]) {
        return keys.every((k) => event.getModifierState(k));
      }

      const params = interactionMap.get(interactionId);
      assertDefined(params, `Interaction ${interactionId} is not registered.`);

      const { disabled } = params;

      if (disabled) {
        return false;
      }

      const matchingInteractions = registeredInteractions.filter(
        ({ modifierKeys: keys, button }) =>
          isButtonPressed(button) && areKeysPressed(keys)
      );

      if (matchingInteractions.length === 0) {
        return false;
      }

      if (matchingInteractions.length === 1) {
        return matchingInteractions[0].id === interactionId;
      }

      // If conflicting interactions, the one with the most modifier keys take precedence
      const [maxKeyInteraction] = matchingInteractions
        .sort((a, b) => a.modifierKeys.length - b.modifierKeys.length)
        .reverse();

      return maxKeyInteraction.id === interactionId;
    },
    [interactionMap]
  );

  return (
    <InteractionsContext.Provider
      value={{
        registerInteraction,
        unregisterInteraction,
        shouldInteract,
      }}
    >
      {children}
    </InteractionsContext.Provider>
  );
}

export default InteractionsProvider;
