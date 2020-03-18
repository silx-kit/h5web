import React, { ReactNode, useState, useEffect } from 'react';
import { HsdsApi } from './api';
import Provider from '../Provider';

interface Props {
  domain: string;
  children: ReactNode;
}

/* Provider of metadata and values by HSDS */
function HsdsProvider(props: Props): JSX.Element {
  const { domain, children } = props;
  const [api, setApi] = useState<HsdsApi>();

  useEffect(() => {
    setApi(new HsdsApi(domain));
  }, [domain]);

  return <Provider api={api}>{children}</Provider>;
}

export default HsdsProvider;
