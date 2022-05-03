import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import DataProvider from '../DataProvider';
import { HsdsApi } from './hsds-api';

interface Props {
  url: string;
  username: string;
  password: string;
  filepath: string;
}

function HsdsProvider(props: PropsWithChildren<Props>) {
  const { url, username, password, filepath, children } = props;

  const api = useMemo(
    () => new HsdsApi(url, username, password, filepath),
    [filepath, password, url, username]
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default HsdsProvider;
