import { DataProvider } from '@h5web/app';
import type { DataProviderApi } from '@h5web/app/src/providers/api';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';

import { H5WasmApi } from './h5wasm-api';

interface Props {
  filename: string;
  buffer: ArrayBuffer;
  getExportURL?: DataProviderApi['getExportURL'];
}

function H5WasmProvider(props: PropsWithChildren<Props>) {
  const { filename, buffer, getExportURL, children } = props;

  const api = useMemo(
    () => new H5WasmApi(filename, buffer, getExportURL),
    [filename, buffer, getExportURL]
  );

  useEffect(() => {
    return () => void api.cleanUp();
  }, [api]);

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5WasmProvider;
