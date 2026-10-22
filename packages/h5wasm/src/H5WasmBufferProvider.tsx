import { DataProvider, type DataProviderApi } from '@h5web/app';
import { type PropsWithChildren, useEffect, useState } from 'react';

import { H5WasmApi } from './h5wasm-api';
import { type Plugin } from './models';
import { getH5WasmRemote } from './remote';

interface Props {
  filename: string;
  buffer: ArrayBuffer;
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
}

interface State extends Props {
  api: H5WasmApi;
}

function H5WasmBufferProvider(props: PropsWithChildren<Props>) {
  const { filename, buffer, getExportURL, getPlugin, children } = props;
  const [state, setState] = useState<State>();

  useEffect(() => {
    const remote = getH5WasmRemote();
    const fileId = remote.openFileBuffer(buffer);

    const api = new H5WasmApi(
      remote,
      filename,
      fileId,
      getExportURL,
      getPlugin,
    );

    setState({ api, buffer, filename, getExportURL, getPlugin });

    return () => {
      void api.cleanUp();
    };
  }, [buffer, filename, getExportURL, getPlugin]);

  const isCurrent =
    state?.buffer === buffer &&
    state.filename === filename &&
    state.getExportURL === getExportURL &&
    state.getPlugin === getPlugin;

  // Don't render with a stale API instance, which is about to be disposed
  if (!isCurrent) {
    return null;
  }

  return <DataProvider api={state.api}>{children}</DataProvider>;
}

export default H5WasmBufferProvider;
