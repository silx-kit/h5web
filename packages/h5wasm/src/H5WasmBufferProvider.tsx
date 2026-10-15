import { DataProvider, type DataProviderApi } from '@h5web/app';
import { type PropsWithChildren } from 'react';

import { useH5WasmApi } from './hooks';
import { type Plugin } from './models';

interface Props {
  filename: string;
  buffer: ArrayBuffer;
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
}

function H5WasmBufferProvider(props: PropsWithChildren<Props>) {
  const { filename, buffer, getExportURL, getPlugin, children } = props;

  const api = useH5WasmApi(
    filename,
    async (remote) => remote.openFileBuffer(buffer),
    [buffer],
    getExportURL,
    getPlugin,
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5WasmBufferProvider;
