import React, { ReactNode, ReactElement, useMemo } from 'react';
import { HsdsApi } from './api';
import Provider from '../Provider';

interface Props {
  url: string;
  username: string;
  password: string;
  domain: string;
  children: ReactNode;
}

function HsdsProvider(props: Props): ReactElement {
  const { url, username, password, domain, children } = props;

  const api = useMemo(() => new HsdsApi(url, username, password, domain), [
    domain,
    password,
    url,
    username,
  ]);

  return <Provider api={api}>{children}</Provider>;
}

export default HsdsProvider;
