type FetchFunc<Input, Result> = (
  input: Input,
  options: { signal: AbortSignal },
) => Promise<Result>;

type AreEqual<Input> = (a: Input, b: Input) => boolean;

interface Instance<Result> {
  get: () => Result;
  abort: () => void;
}

export interface FetchStore<Input, Result> {
  prefetch: (input: Input) => void;
  get: (input: Input) => Result;
  preset: (input: Input, result: Result) => void;
  evict: (input: Input) => void;
  abort: (input: Input) => void;
}

export function createFetchStore<Input, Result>(
  fetchFunc: FetchFunc<Input, Result>,
  areEqual: AreEqual<Input> = Object.is,
) {
  const cache = createCache<Input, Instance<Result>>(areEqual);

  return {
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
        abort: () => {
          /* noop */
        },
      });
    },
    evict: (input: Input): void => {
      cache.delete(input);
    },
    abort: (input: Input): void => {
      cache.get(input)?.abort();
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
      result = await fetchFunc(input, { signal: controller.signal });
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
    abort: () => {
      controller.abort();
    },
  };
}
