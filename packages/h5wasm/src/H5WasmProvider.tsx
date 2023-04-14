import { DataProvider } from '@h5web/app';
import { type DataProviderApi } from '@h5web/app/src/providers/api';
import { type PropsWithChildren, useEffect, useState } from 'react';

import { H5WasmApi } from './h5wasm-api';

interface Props {
  filename: string;
  buffer: ArrayBuffer;
  getExportURL?: DataProviderApi['getExportURL'];
}

function H5WasmProvider(props: PropsWithChildren<Props>) {
  const { filename, buffer, getExportURL, children } = props;

  const [api, setApi] = useState<H5WasmApi>();

  useEffect(() => {
    const h5wasmApi = new H5WasmApi(filename, buffer, getExportURL);
    setApi(h5wasmApi);

    return () => void h5wasmApi.cleanUp();
  }, [filename, buffer, getExportURL]);

  if (!api) {
    return null;
  }

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5WasmProvider;
