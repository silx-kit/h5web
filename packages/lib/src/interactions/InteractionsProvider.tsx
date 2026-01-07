import { type NoProps } from '@h5web/shared/vis-models';
import { castArray } from '@h5web/shared/vis-utils';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';

import { Interaction } from './interaction';
import { type InteractionConfig } from './models';

export interface InteractionsContextValue {
  registerInteraction: (id: string, config: InteractionConfig) => void;
  unregisterInteraction: (id: string) => void;
  getInteractions: (
    button?: InteractionConfig['button'],
    modifierKey?: InteractionConfig['modifierKey'],
  ) => Interaction[];
  shouldInteract: (id: string, event: MouseEvent) => boolean;
}

const InteractionsContext = createContext({} as InteractionsContextValue);

export function useInteractionsContext() {
  return useContext(InteractionsContext);
}

function InteractionsProvider(props: PropsWithChildren<NoProps>) {
  const { children } = props;

  const [interactionMap] = useState(new Map<string, Interaction>());

  const registerInteraction = useCallback(
    (id: string, config: InteractionConfig): void => {
      if (interactionMap.has(id)) {
        console.warn(`An interaction with ID "${id}" is already registered.`); // eslint-disable-line no-console
      } else {
        interactionMap.set(id, new Interaction(id, config));
      }
    },
    [interactionMap],
  );

  const unregisterInteraction = useCallback(
    (id: string): void => {
      interactionMap.delete(id);
    },
    [interactionMap],
  );

  const getInteractions = useCallback(
    (
      button?: InteractionConfig['button'],
      modifierKey?: InteractionConfig['modifierKey'],
    ): Interaction[] => {
      const interactions = [...interactionMap.values()].filter(
        (inter) => inter.isEnabled,
      );

      if (button === undefined) {
        return interactions;
      }

      const modifierKeys = modifierKey ? castArray(modifierKey) : [];

      if (button === 'Wheel') {
        return interactions.filter(
          (inter) =>
            inter.isWheel &&
            modifierKeys.every((k) => inter.modifierKeys.includes(k)),
        );
      }

      const buttons = castArray(button);
      return interactions.filter((inter) =>
        buttons.some(
          (b) =>
            inter.buttons.includes(b) &&
            modifierKeys.every((k) => inter.modifierKeys.includes(k)),
        ),
      );
    },
    [interactionMap],
  );

  const shouldInteract = useCallback(
    (interactionId: string, event: MouseEvent | WheelEvent): boolean => {
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
        getInteractions,
        shouldInteract,
      }}
    >
      {children}
    </InteractionsContext.Provider>
  );
}

export default InteractionsProvider;
