import type { DataProviderApi } from '@h5web/app';
import { DataProvider } from '@h5web/app';
import type { PropsWithChildren } from 'react';
import { useMemo, useState } from 'react';

import type { Plugin } from '../models';
import { H5WasmLocalFileApi } from './h5wasm-local-file-api';

interface Props {
  file: File;
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
}

function H5WasmLocalFileProvider(props: PropsWithChildren<Props>) {
  const { file, getExportURL, getPlugin, children } = props;

  const api = useMemo(
    () => new H5WasmLocalFileApi(file, getExportURL, getPlugin),
    [file, getExportURL, getPlugin],
  );

  const [prevApi, setPrevApi] = useState(api);
  if (prevApi !== api) {
    setPrevApi(api);
    void prevApi.cleanUp(); // https://github.com/silx-kit/h5web/pull/1568
  }

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5WasmLocalFileProvider;
