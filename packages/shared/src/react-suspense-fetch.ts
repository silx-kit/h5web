type FetchFunc<Input, Result> = (
  input: Input,
  signal: AbortSignal,
) => Promise<Result>;

type AreEqual<Input> = (a: Input, b: Input) => boolean;

interface Instance<Result> {
  get: () => Result;
  isError: () => boolean;
  abort: (reason?: string) => void;
}

export interface FetchStore<Input, Result> {
  has: (input: Input) => boolean;
  prefetch: (input: Input) => void;
  get: (input: Input) => Result;
  preset: (input: Input, result: Result) => void;
  evict: (input: Input) => void;
  evictErrors: () => void;
  abort: (input: Input, reason?: string) => void;
  abortAll: (reason?: string) => void;
}

export function createFetchStore<Input, Result>(
  fetchFunc: FetchFunc<Input, Result>,
  areEqual: AreEqual<Input> = Object.is,
) {
  const cache = createCache<Input, Instance<Result>>(areEqual);

  return {
    has: (input: Input): boolean => cache.has(input),
    prefetch: (input: Input): void => {
      if (!cache.has(input)) {
        cache.set(input, createInstance(input, fetchFunc));
      }
    },
    get: (input: Input): Result => {
      const instance = cache.get(input) || createInstance(input, fetchFunc);
      cache.set(input, instance);
      return instance.get();
    },
    preset: (input: Input, result: Result): void => {
      cache.set(input, {
        get: () => result,
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
    abort: (input: Input, reason?: string): void => {
      cache.get(input)?.abort(reason);
    },
    abortAll: (reason?: string): void => {
      cache.values().forEach((instance) => instance.abort(reason));
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
): Instance<Result> {
  let promise: Promise<void> | undefined;
  let result: Result | undefined;
  let error: unknown;
  const controller = new AbortController();

  promise = (async () => {
    try {
      result = await fetchFunc(input, controller.signal);
    } catch (error_) {
      error = error_;
    } finally {
      promise = undefined;
    }
  })();

  return {
    get: () => {
      if (promise) {
        throw promise; // eslint-disable-line @typescript-eslint/no-throw-literal
      }
      if (error !== undefined) {
        throw error; // eslint-disable-line @typescript-eslint/no-throw-literal
      }
      return result as Result;
    },
    isError: () => error !== undefined,
    abort: (reason?: string) => {
      controller.abort(reason);
    },
  };
}
