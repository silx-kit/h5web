import type { DataProviderApi } from '@h5web/app';
import { DataProvider } from '@h5web/app';
import type { PropsWithChildren } from 'react';
import { useMemo, useState } from 'react';

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

  const api = useMemo(
    () => new H5WasmApi(filename, buffer, getExportURL, getPlugin),
    [buffer, filename, getExportURL, getPlugin],
  );

  const [prevApi, setPrevApi] = useState(api);
  if (prevApi !== api) {
    setPrevApi(api);
    void prevApi.cleanUp(); // https://github.com/silx-kit/h5web/pull/1568
  }

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5WasmProvider;
