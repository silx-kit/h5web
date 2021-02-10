/* eslint-disable @typescript-eslint/no-explicit-any */
import { pickBy } from 'lodash-es';
import { createFetchStore } from 'react-suspense-fetch';

export interface ObjectKeyStore<R, I extends {}> {
  get: (obj: I) => R;
  prefetch: (obj: I) => void;
  evict: (obj: I) => void;
}

/**
 * Create a suspense store with a reliable `Map` cache around an async
 * function with an object parameter. `react-suspense-fetch` uses a
 * `WeakMap` cache in this case.
 *
 * Interaction with the underlying `react-suspense-fetch` store is done by
 * JSON-stringifying/parsing the input object.
 */
export function createObjectKeyStore<R, I extends {}>(
  fetchFunc: (obj: I) => Promise<R>
): ObjectKeyStore<R, I> {
  const store = createFetchStore((key: string) => {
    return fetchFunc(JSON.parse(key));
  });

  function wrapMethod<T>(method: (key: string) => T) {
    return (params: I) => {
      /* Remove optional params that are explicitely set to `undefined`.
       * This is to guarantee that, for instance, `{ foo: undefined; }` and `{}`
       * are both stringified to (and cached with) "{}" */
      const pickedParams = pickBy(params, (v) => v !== undefined);

      return method(JSON.stringify(pickedParams));
    };
  }

  const { get, prefetch, evict } = store;
  return {
    get: wrapMethod(get),
    prefetch: wrapMethod(prefetch),
    evict: wrapMethod(evict),
  };
}
