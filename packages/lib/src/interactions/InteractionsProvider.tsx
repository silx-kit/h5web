import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

import {
  type InteractionEntry,
  type ModifierKey,
  type MouseButton,
} from './models';

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
      if (interactionMap.has(id)) {
        console.warn(`An interaction with ID "${id}" is already registered.`); // eslint-disable-line no-console
      } else {
        interactionMap.set(id, { id, ...value });
      }
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

      function isButtonPressed(button: MouseButton | MouseButton[] | 'Wheel') {
        if (event instanceof WheelEvent) {
          return button === 'Wheel';
        }

        return Array.isArray(button)
          ? button.includes(event.button)
          : event.button === button;
      }

      function areKeysPressed(keys: ModifierKey[]) {
        return keys.every((k) => event.getModifierState(k));
      }

      if (!interactionMap.has(interactionId)) {
        throw new Error(`Interaction ${interactionId} is not registered`);
      }

      const matchingInteractions = registeredInteractions.filter(
        ({ modifierKeys: keys, button, disabled }) =>
          !disabled && isButtonPressed(button) && areKeysPressed(keys)
      );

      if (matchingInteractions.length === 0) {
        return false;
      }

      if (matchingInteractions.length === 1) {
        return matchingInteractions[0].id === interactionId;
      }

      // If conflicting interactions, the one with the most modifier keys take precedence
      matchingInteractions.sort(
        (a, b) => b.modifierKeys.length - a.modifierKeys.length
      );

      const [maxKeyInteraction] = matchingInteractions;
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
