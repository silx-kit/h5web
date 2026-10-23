import { DataProvider, type DataProviderApi } from '@h5web/app';
import { type PropsWithChildren, useEffect, useState } from 'react';

import { H5WasmApi } from './h5wasm-api';
import { type Plugin } from './models';
import { getH5WasmRemote } from './remote';

interface Props {
  file: File;
  resetKeys?: unknown[];
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
}

interface State extends Props {
  api: H5WasmApi;
  resetKeys: unknown[]; // defaults to `[]`
}

function H5WasmLocalFileProvider(props: PropsWithChildren<Props>) {
  const { file, resetKeys = [], getExportURL, getPlugin, children } = props;

  const [state, setState] = useState<State>();

  useEffect(() => {
    const remote = getH5WasmRemote();
    const fileId = remote.openLocalFile(file);
    const api = new H5WasmApi(
      remote,
      file.name,
      fileId,
      getExportURL,
      getPlugin,
    );

    setState({ api, file, resetKeys, getExportURL, getPlugin });

    return () => {
      void api.cleanUp();
    };
  }, [file, ...resetKeys, getExportURL, getPlugin]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCurrent =
    state?.file === file &&
    state.resetKeys.length === resetKeys.length &&
    state.resetKeys.every((val, i) => Object.is(val, resetKeys[i])) &&
    state.getExportURL === getExportURL &&
    state.getPlugin === getPlugin;

  // Don't render with a stale API instance, which is about to be disposed
  if (!isCurrent) {
    return null;
  }

  return <DataProvider api={state.api}>{children}</DataProvider>;
}

export default H5WasmLocalFileProvider;
