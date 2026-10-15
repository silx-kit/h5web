import { type DataProviderApi } from '@h5web/app';
import { type Remote } from 'comlink';
import { useEffect, useRef } from 'react';

import { H5WasmApi } from './h5wasm-api';
import { type Plugin } from './models';
import { getH5WasmRemote } from './remote';
import { type H5WasmWorkerAPI } from './worker';

const pendingCleanUps = new WeakMap<H5WasmApi, ReturnType<typeof setTimeout>>();

export function useH5WasmApi(
  filename: string,
  openFile: (remote: Remote<H5WasmWorkerAPI>) => Promise<bigint>,
  deps: unknown[], // dependencies of `openFile`
  getExportURL?: DataProviderApi['getExportURL'],
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>,
): H5WasmApi {
  const allDeps = [filename, ...deps, getExportURL, getPlugin];

  /* Open file when dependencies change. Don't use `useMemo`, as React may call its function
   * more than once (e.g. in StrictMode) and keep a different API than the last one created. */
  const stateRef = useRef<{ api: H5WasmApi; deps: unknown[] }>(undefined);
  if (!stateRef.current || !areDepsEqual(stateRef.current.deps, allDeps)) {
    const remote = getH5WasmRemote();
    const api = new H5WasmApi(
      remote,
      filename,
      openFile(remote),
      getExportURL,
      getPlugin,
    );

    stateRef.current = { api, deps: allDeps };
  }

  const { api } = stateRef.current;

  /* Close file once API is no longer used. Defer clean-up so it can be cancelled if effect is
   * re-run with the same API straight away (e.g. in StrictMode). */
  useEffect(() => {
    clearTimeout(pendingCleanUps.get(api));
    pendingCleanUps.delete(api);

    return () => {
      pendingCleanUps.set(
        api,
        setTimeout(() => {
          pendingCleanUps.delete(api);
          void api.cleanUp();
        }),
      );
    };
  }, [api]);

  return api;
}

function areDepsEqual(deps: unknown[], otherDeps: unknown[]): boolean {
  return (
    deps.length === otherDeps.length &&
    deps.every((dep, index) => Object.is(dep, otherDeps[index]))
  );
}
