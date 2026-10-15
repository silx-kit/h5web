import { type DataProviderApi } from '@h5web/app';
import { type Remote } from 'comlink';
import { useMemo, useRef } from 'react';

import { H5WasmApi } from './h5wasm-api';
import { type Plugin } from './models';
import { getH5WasmRemote } from './remote';
import { type H5WasmWorkerAPI } from './worker';

export function useH5WasmApi(
  filename: string,
  openFile: (remote: Remote<H5WasmWorkerAPI>) => Promise<bigint>,
  deps: unknown[], // dependencies of `openFile`
  getExportURL?: DataProviderApi['getExportURL'],
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>,
): H5WasmApi {
  const prevApiRef = useRef<H5WasmApi>();

  return useMemo(() => {
    const remote = getH5WasmRemote();
    const fileId = openFile(remote);

    const newApi = new H5WasmApi(
      remote,
      filename,
      fileId,
      getExportURL,
      getPlugin,
    );

    void prevApiRef.current?.cleanUp();
    prevApiRef.current = newApi;

    return newApi;
  }, [filename, ...deps, getExportURL, getPlugin]); // eslint-disable-line react-hooks/exhaustive-deps
}
