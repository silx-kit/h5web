import { ReactNode, useMemo } from 'react';
import { HsdsApi } from './hsds-api';
import Provider from '../Provider';

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
