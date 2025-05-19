import { type PropsWithChildren, useMemo } from 'react';

import { type DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
import { type Fetcher } from '../models';
import { H5GroveApi } from './h5grove-api';

interface Props {
  baseUrl: string;
  filepath: string;
  resetKeys?: unknown[];
  fetcher?: Fetcher;
  getExportURL?: DataProviderApi['getExportURL'];
}

function H5GroveProvider(props: PropsWithChildren<Props>) {
  const {
    baseUrl,
    filepath,
    resetKeys = [],
    fetcher,
    getExportURL,
    children,
  } = props;

  const api = useMemo(
    () => new H5GroveApi(baseUrl, filepath, fetcher, getExportURL),
    [filepath, baseUrl, ...resetKeys, fetcher, getExportURL], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5GroveProvider;
