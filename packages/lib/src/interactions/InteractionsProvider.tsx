import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

import { Interaction } from './interaction';
import { type InteractionConfig } from './models';

export interface InteractionsContextValue {
  registerInteraction: (id: string, config: InteractionConfig) => void;
  unregisterInteraction: (id: string) => void;
  shouldInteract: (id: string, event: MouseEvent) => boolean;
}

const InteractionsContext = createContext({} as InteractionsContextValue);

export function useInteractionsContext() {
  return useContext(InteractionsContext);
}

function InteractionsProvider(props: { children: ReactNode }) {
  const { children } = props;

  const [interactionMap] = useState(new Map<string, Interaction>());

  const registerInteraction = useCallback(
    (id: string, config: InteractionConfig) => {
      if (interactionMap.has(id)) {
        console.warn(`An interaction with ID "${id}" is already registered.`); // eslint-disable-line no-console
      } else {
        interactionMap.set(id, new Interaction(id, config));
      }
    },
    [interactionMap],
  );

  const unregisterInteraction = useCallback(
    (id: string) => {
      interactionMap.delete(id);
    },
    [interactionMap],
  );

  const shouldInteract = useCallback(
    (interactionId: string, event: MouseEvent | WheelEvent) => {
      const registeredInteractions = [...interactionMap.values()];
      if (!interactionMap.has(interactionId)) {
        throw new Error(`Interaction ${interactionId} is not registered`);
      }

      const matchingInteractions = registeredInteractions.filter(
        (interaction) => interaction.matches(event),
      );

      if (matchingInteractions.length === 0) {
        return false;
      }

      if (matchingInteractions.length === 1) {
        return matchingInteractions[0].id === interactionId;
      }

      // If conflicting interactions, the one with the most modifier keys takes precedence
      const maxKeysInteraction = matchingInteractions.reduce((acc, next) =>
        next.modifierKeys.length > acc.modifierKeys.length ? next : acc,
      );

      return maxKeysInteraction.id === interactionId;
    },
    [interactionMap],
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
