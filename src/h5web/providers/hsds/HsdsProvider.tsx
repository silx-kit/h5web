import React, { ReactNode, useState, useEffect, ReactElement } from 'react';
import { HsdsApi } from './api';
import Provider from '../Provider';

interface Props {
  url: string;
  username: string;
  password: string;
  filepath: string;
  children: ReactNode;
}

/* Provider of metadata and values by HSDS */
function HsdsProvider(props: Props): ReactElement {
  const { url, username, password, filepath, children } = props;
  const [api, setApi] = useState<HsdsApi>();

  useEffect(() => {
    setApi(new HsdsApi(url, username, password, filepath));
  }, [filepath, password, url, username]);

  return <Provider api={api}>{children}</Provider>;
}

export default HsdsProvider;
