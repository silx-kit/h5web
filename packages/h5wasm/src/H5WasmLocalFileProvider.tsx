import { DataProvider, type DataProviderApi } from '@h5web/app';
import { type PropsWithChildren, useMemo, useRef } from 'react';

import { H5WasmApi } from './h5wasm-api';
import { type Plugin } from './models';
import { getH5WasmRemote } from './remote';

interface Props {
  file: File;
  resetKeys?: unknown[];
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
}

function H5WasmLocalFileProvider(props: PropsWithChildren<Props>) {
  const { file, resetKeys = [], getExportURL, getPlugin, children } = props;

  const prevApiRef = useRef<H5WasmApi>();

  const api = useMemo(() => {
    const remote = getH5WasmRemote();
    const fileId = remote.openLocalFile(file);

    const newApi = new H5WasmApi(
      remote,
      file.name,
      fileId,
      getExportURL,
      getPlugin,
    );

    void prevApiRef.current?.cleanUp();
    prevApiRef.current = newApi;

    return newApi;
  }, [file, ...resetKeys, getExportURL, getPlugin]); // eslint-disable-line react-hooks/exhaustive-deps

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5WasmLocalFileProvider;
