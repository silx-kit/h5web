import { type PropsWithChildren, useMemo } from 'react';

import { type DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
import { type Fetcher } from '../models';
import { HsdsApi } from './hsds-api';

interface Props {
  url: string;
  filepath: string;
  resetKeys?: unknown[];
  fetcher: Fetcher;
  getExportURL?: DataProviderApi['getExportURL'];
}

function HsdsProvider(props: PropsWithChildren<Props>) {
  const {
    url,
    filepath,
    resetKeys = [],
    fetcher,
    getExportURL,
    children,
  } = props;

  const api = useMemo(
    () => new HsdsApi(url, filepath, fetcher, getExportURL),
    [url, filepath, ...resetKeys, fetcher, getExportURL], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default HsdsProvider;
