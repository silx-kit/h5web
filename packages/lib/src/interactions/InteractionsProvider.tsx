import { assertDefined, isDefined } from '@h5web/shared';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

import type { Interaction } from './models';

export interface InteractionsContextValue {
  registerInteraction: (id: string, value: Interaction) => void;
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
    (id: string, value: Interaction) => {
      interactionMap.set(id, value);
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
    (id: string, event: MouseEvent) => {
      const registeredKeys = [...interactionMap.values()]
        .map((params: Interaction) => params.modifierKey)
        .filter(isDefined);

      const params = interactionMap.get(id);
      assertDefined(params, `Interaction ${id} is not registered.`);

      const { disabled, modifierKey } = params;
      if (disabled) {
        return false;
      }

      if (modifierKey !== undefined) {
        return event.getModifierState(modifierKey);
      }

      // Check that there is no conflicting interaction
      return registeredKeys.every((key) => !event.getModifierState(key));
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
