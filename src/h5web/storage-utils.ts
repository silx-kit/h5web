import create, { State, StateCreator, StoreApi, UseStore } from 'zustand';

export interface StorageConfig {
  storageId: string;
  itemsToPersist: string[];
}

function fromStorage<T>(id: string): T | undefined {
  try {
    const value = window.localStorage.getItem(id);
    return value !== undefined && value !== null
      ? JSON.parse(value)
      : undefined;
  } catch {
    // Access to local storage may not be authorized or available,
    // or the data stored may be corrupted.
    return undefined;
  }
}

export function createPersistableState<S extends State>(
  config: StorageConfig,
  createState: StateCreator<S>
): [UseStore<S>, StoreApi<S>] {
  const { storageId, itemsToPersist } = config;

  return create<S>((set, get, api) => {
    // Retrieve persisted state, if any
    const persistedState = fromStorage<Partial<S>>(storageId);

    // Invoke provided state creator to retrieve initial state
    const initialState = createState(
      // Monkey patch `set` to persist state on every call
      args => {
        set(args);

        // Retrieve new state to persist, keeping only the relevant keys
        const newStateStr = JSON.stringify(get(), itemsToPersist);

        try {
          window.localStorage.setItem(storageId, newStateStr);
        } catch {
          // Do nothing (local storage may be unavailable or unauthorized)
        }
      },
      get,
      api
    );

    return {
      ...initialState,
      ...persistedState, // restore persisted state
    };
  });
}
