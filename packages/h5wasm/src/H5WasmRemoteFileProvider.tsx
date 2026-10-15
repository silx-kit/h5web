import { DataProvider, type DataProviderApi } from '@h5web/app';
import { type PropsWithChildren } from 'react';

import { useH5WasmApi } from './hooks';
import { type Plugin } from './models';
import { getFilenameFromUrl, resolveUrl } from './utils';

interface Props {
  url: string;
  filename?: string;
  resetKeys?: unknown[];
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
}

function H5WasmRemoteFileProvider(props: PropsWithChildren<Props>) {
  const { url, resetKeys = [], getExportURL, getPlugin, children } = props;

  // Worker can't resolve relative URLs on its own
  const absoluteUrl = resolveUrl(url, document.baseURI);
  const { filename = getFilenameFromUrl(absoluteUrl) } = props;

  const api = useH5WasmApi(
    filename,
    async (remote) => remote.openRemoteFile(absoluteUrl),
    [absoluteUrl, ...resetKeys],
    getExportURL,
    getPlugin,
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5WasmRemoteFileProvider;
