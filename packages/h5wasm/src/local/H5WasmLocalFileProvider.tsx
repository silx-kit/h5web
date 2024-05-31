import type { DataProviderApi } from '@h5web/app';
import { DataProvider } from '@h5web/app';
import type { PropsWithChildren } from 'react';
import { useMemo, useRef } from 'react';

import type { Plugin } from '../models';
import { H5WasmLocalFileApi } from './h5wasm-local-file-api';

interface Props {
  file: File;
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
}

function H5WasmLocalFileProvider(props: PropsWithChildren<Props>) {
  const { file, getExportURL, getPlugin, children } = props;

  const prevApiRef = useRef<H5WasmLocalFileApi>();

  const api = useMemo(() => {
    const newApi = new H5WasmLocalFileApi(file, getExportURL, getPlugin);

    void prevApiRef.current?.cleanUp();
    prevApiRef.current = newApi;

    return newApi;
  }, [file, getExportURL, getPlugin]);

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5WasmLocalFileProvider;
