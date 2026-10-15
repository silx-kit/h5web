import { type PropsWithChildren, useMemo } from 'react';

import { type DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
import { type Fetcher } from '../models';
import { HsdsApi } from './hsds-api';

interface Props {
  url: string;
  domain: string;
  resetKeys?: unknown[];
  fetcher?: Fetcher;
  getExportURL?: DataProviderApi['getExportURL'];
}

function HsdsProvider(props: PropsWithChildren<Props>) {
  const {
    url,
    domain,
    resetKeys = [],
    fetcher,
    getExportURL,
    children,
  } = props;

  const api = useMemo(
    () => new HsdsApi(url, domain, fetcher, getExportURL),
    [url, domain, ...resetKeys, fetcher, getExportURL], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default HsdsProvider;
