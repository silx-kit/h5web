import { type NoProps } from '@h5web/shared/vis-models';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { type Vector3 } from 'three';
import { createStore, type StoreApi } from 'zustand';

interface KeepZoomState {
  states: Map<
    string,
    { visContextKey: string | undefined; position: Vector3; scale: Vector3 }
  >;
  setState: (
    visKey: string,
    visContextKey: string,
    position: Vector3,
    scale: Vector3,
  ) => void;
  unset: (visKey: string) => void;
}

function createKeepZoomStore() {
  return createStore<KeepZoomState>()(
    (set, get): KeepZoomState => ({
      states: new Map(),

      setState: (visKey, visContextKey, position, scale) => {
        const states = new Map(get().states);
        states.set(visKey, {
          visContextKey,
          position: position.clone(),
          scale: scale.clone(),
        });

        set({ states });
      },

      unset: (visKey) => {
        const states = new Map(get().states);
        states.delete(visKey);
        set({ states });
      },
    }),
  );
}

const StoreContext = createContext({} as StoreApi<KeepZoomState>);

export function KeepZoomProvider(props: PropsWithChildren<NoProps>) {
  const { children } = props;

  const [store] = useState(createKeepZoomStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useKeepZoomStore() {
  return useContext(StoreContext);
}
