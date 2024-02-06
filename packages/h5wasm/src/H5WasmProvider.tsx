import type { DataProviderApi } from '@h5web/app';
import { DataProvider } from '@h5web/app';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import { H5WasmApi } from './h5wasm-api';
import type { Plugin } from './utils';

interface Props {
  filename: string;
  buffer: ArrayBuffer;
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
}

function H5WasmProvider(props: PropsWithChildren<Props>) {
  const { filename, buffer, getExportURL, getPlugin, children } = props;

  const [api, setApi] = useState<H5WasmApi>();

  useEffect(() => {
    const h5wasmApi = new H5WasmApi(filename, buffer, getExportURL, getPlugin);
    setApi(h5wasmApi);

    return () => void h5wasmApi.cleanUp();
  }, [filename, buffer, getExportURL, getPlugin]);

  if (!api) {
    return null;
  }

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5WasmProvider;
