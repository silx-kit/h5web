import { DataProvider, type DataProviderApi } from '@h5web/app';
import { type PropsWithChildren, useEffect, useState } from 'react';

import { H5WasmApi } from './h5wasm-api';
import { type Plugin } from './models';
import { getH5WasmRemote } from './remote';
import { getFilenameFromUrl, resolveUrl } from './utils';

interface Props {
  url: string;
  filename?: string;
  resetKeys?: unknown[];
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
}

interface State extends Props {
  api: H5WasmApi;
  filename: string;
  resetKeys: unknown[]; // defaults to `[]`
}

function H5WasmRemoteFileProvider(props: PropsWithChildren<Props>) {
  const { url, resetKeys = [], getExportURL, getPlugin, children } = props;

  // Worker can't resolve relative URLs on its own
  const absoluteUrl = resolveUrl(url, document.baseURI);
  const { filename = getFilenameFromUrl(absoluteUrl) } = props;

  const [state, setState] = useState<State>();

  useEffect(() => {
    const remote = getH5WasmRemote();
    const fileId = remote.openRemoteFile(absoluteUrl);
    const api = new H5WasmApi(
      remote,
      filename,
      fileId,
      getExportURL,
      getPlugin,
    );

    setState({
      api,
      url: absoluteUrl,
      filename,
      resetKeys,
      getExportURL,
      getPlugin,
    });

    return () => {
      void api.cleanUp();
    };
  }, [absoluteUrl, filename, ...resetKeys, getExportURL, getPlugin]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCurrent =
    state?.url === absoluteUrl &&
    state.filename === filename &&
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

export default H5WasmRemoteFileProvider;
