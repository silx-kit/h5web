import { type PropsWithChildren, useMemo } from 'react';

import { type DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
import { type Fetcher } from '../models';
import { H5GroveApi } from './h5grove-api';

interface Props {
  url: string;
  filepath: string;
  resetKeys?: unknown[];
  fetcher?: Fetcher;
  getExportURL?: DataProviderApi['getExportURL'];
}

function H5GroveProvider(props: PropsWithChildren<Props>) {
  const {
    url,
    filepath,
    resetKeys = [],
    fetcher,
    getExportURL,
    children,
  } = props;

  const api = useMemo(
    () => new H5GroveApi(url, filepath, fetcher, getExportURL),
    [filepath, url, ...resetKeys, fetcher, getExportURL], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5GroveProvider;
