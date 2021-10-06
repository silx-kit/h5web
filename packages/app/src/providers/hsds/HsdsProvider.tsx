import type { ReactNode } from 'react';
import { useMemo } from 'react';

import Provider from '../Provider';
import { HsdsApi } from './hsds-api';

interface Props {
  url: string;
  username: string;
  password: string;
  filepath: string;
  children: ReactNode;
}

function HsdsProvider(props: Props) {
  const { url, username, password, filepath, children } = props;

  const api = useMemo(
    () => new HsdsApi(url, username, password, filepath),
    [filepath, password, url, username]
  );

  return <Provider api={api}>{children}</Provider>;
}

export default HsdsProvider;
