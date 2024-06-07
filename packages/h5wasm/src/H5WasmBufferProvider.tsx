import type { DataProviderApi } from '@h5web/app';
import { DataProvider } from '@h5web/app';
import type { PropsWithChildren } from 'react';
import { useMemo, useRef } from 'react';

import { H5WasmApi } from './h5wasm-api';
import type { Plugin } from './models';
import { getH5WasmRemote } from './remote';

interface Props {
  filename: string;
  buffer: ArrayBuffer;
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
}

function H5WasmBufferProvider(props: PropsWithChildren<Props>) {
  const { filename, buffer, getExportURL, getPlugin, children } = props;

  const prevApiRef = useRef<H5WasmApi>();

  const api = useMemo(() => {
    const remote = getH5WasmRemote();
    const fileId = remote.openFileBuffer(buffer);

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
  }, [buffer, filename, getExportURL, getPlugin]);

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5WasmBufferProvider;
