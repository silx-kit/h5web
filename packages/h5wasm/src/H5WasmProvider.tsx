import { DataProvider } from '@h5web/app';
import type { PropsWithChildren } from 'react';
import { useState, useEffect } from 'react';

import { H5WasmApi } from './h5wasm-api';

interface Props {
  filename: string;
  buffer: ArrayBuffer;
}

function H5WasmProvider(props: PropsWithChildren<Props>) {
  const { filename, buffer, children } = props;

  const [api, setApi] = useState<H5WasmApi>();

  useEffect(() => {
    const h5wasmApi = new H5WasmApi(filename, buffer);
    setApi(h5wasmApi);

    return () => void h5wasmApi.cleanUp();
  }, [filename, buffer]);

  if (!api) {
    return null;
  }

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5WasmProvider;
