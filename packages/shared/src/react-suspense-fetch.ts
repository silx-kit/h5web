/* eslint-disable @typescript-eslint/promise-function-async */
import { createStore, type StoreApi } from 'zustand';

type FetchFunc<Input, Result> = (
  input: Input,
  abortSignal: AbortSignal,
  onProgress: OnProgress,
) => Promise<Result>;

type AreEqual<Input> = (a: Input, b: Input) => boolean;
export type OnProgress = (value: number) => void;

interface Instance<Result> {
  get: () => Promise<Result>;
  isError: () => boolean;
  abort: (reason?: string) => void;
}

export interface FetchStore<Input, Result> {
  has: (input: Input) => boolean;
  prefetch: (input: Input) => void;
  get: (input: Input) => Promise<Result>;
  preset: (input: Input, result: Result) => void;
  evict: (input: Input) => void;
  evictErrors: () => void;
  abort: (input: Input, reason?: string, evict?: boolean) => void;
  abortAll: (reason?: string, evict?: boolean) => void;
  get progressStore(): StoreApi<ProgressState<Input>>;
}

interface ProgressState<Input> {
  ongoing: Map<Input, number | undefined>;
  setProgress: (input: Input, value?: number) => void;
  clearProgress: (input: Input) => void;
}

export function createFetchStore<Input, Result>(
  fetchFunc: FetchFunc<Input, Result>,
  areEqual: AreEqual<Input> = Object.is,
): FetchStore<Input, Result> {
  const cache = createCache<Input, Instance<Result>>(areEqual);

  const progressStore = createStore<ProgressState<Input>>((set, get) => ({
    ongoing: new Map(),
    setProgress: (input, value) => {
      const ongoing = new Map(get().ongoing);
      ongoing.set(input, value);
      set({ ongoing });
    },
    clearProgress: (input) => {
      const ongoing = new Map(get().ongoing);
      ongoing.delete(input);
      set({ ongoing });
    },
  }));

  return {
    has: (input: Input): boolean => cache.has(input),
    prefetch: (input: Input): void => {
      if (!cache.has(input)) {
        cache.set(input, createInstance(input, fetchFunc, progressStore));
      }
    },
    get: (input: Input): Promise<Result> => {
      const instance =
        cache.get(input) || createInstance(input, fetchFunc, progressStore);
      cache.set(input, instance);
      return instance.get();
    },
    preset: (input: Input, result: Result): void => {
      const promise = Promise.resolve(result);
      cache.set(input, {
        get: () => promise,
        isError: () => false,
        abort: () => undefined,
      });
    },
    evict: (input: Input): void => {
      cache.delete(input);
    },
    evictErrors: () => {
      cache.entries().forEach(([input, instance]) => {
        if (instance.isError()) {
          cache.delete(input);
        }
      });
    },
    abort: (input: Input, reason?: string, evict?: boolean): void => {
      cache.get(input)?.abort(reason);

      if (evict) {
        cache.delete(input);
      }
    },
    abortAll: (reason?: string, evict?: boolean): void => {
      cache.entries().forEach(([input, instance]) => {
        instance.abort(reason);

        if (evict) {
          cache.delete(input);
        }
      });
    },
    get progressStore() {
      return progressStore;
    },
  };
}

function createCache<K, V>(areEqual: AreEqual<K>) {
  const map = new Map<K, V>();

  return {
    set: (key: K, value: V) => {
      map.set(key, value);
    },
    has: (key: K) => {
      for (const [k] of map) {
        if (areEqual(k, key)) {
          return true;
        }
      }
      return false;
    },
    get: (key: K) => {
      for (const [k, v] of map) {
        if (areEqual(k, key)) {
          return v;
        }
      }
      return undefined;
    },
    delete: (key: K) => {
      for (const [k] of map) {
        if (areEqual(k, key)) {
          map.delete(k);
        }
      }
    },
    entries: () => [...map.entries()],
    values: () => [...map.values()],
  };
}

function createInstance<Input, Result>(
  input: Input,
  fetchFunc: FetchFunc<Input, Result>,
  progressStore: StoreApi<ProgressState<Input>>,
): Instance<Result> {
  let result: Result | undefined;
  let error: unknown;
  const controller = new AbortController();

  const promise: Promise<Result> = (async () => {
    progressStore.getState().setProgress(input);
    result = await fetchFunc(input, controller.signal, (value) => {
      progressStore.getState().setProgress(input, value);
    });
    progressStore.getState().clearProgress(input);
    return result;
  })();

  return {
    get: () => promise,
    isError: () => error !== undefined,
    abort: (reason?: string) => {
      controller.abort(new AbortError(reason));
    },
  };
}

export class AbortError extends Error {
  public constructor(reason?: string) {
    super(reason);
    this.name = 'AbortError';
  }
}
