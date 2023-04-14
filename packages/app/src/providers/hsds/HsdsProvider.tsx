import { type PropsWithChildren, useMemo } from 'react';

import { type DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
import { HsdsApi } from './hsds-api';

interface Props {
  url: string;
  username: string;
  password: string;
  filepath: string;
  getExportURL?: DataProviderApi['getExportURL'];
}

function HsdsProvider(props: PropsWithChildren<Props>) {
  const { url, username, password, filepath, getExportURL, children } = props;

  const api = useMemo(
    () => new HsdsApi(url, username, password, filepath, getExportURL),
    [filepath, password, url, username, getExportURL]
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default HsdsProvider;
