import React, { ReactNode, useState, useEffect, ReactElement } from 'react';
import { SilxApi } from './api';
import Provider from '../Provider';

interface Props {
  domain: string;
  children: ReactNode;
}

function SilxProvider(props: Props): ReactElement {
  const { domain, children } = props;
  const [api, setApi] = useState<SilxApi>();

  useEffect(() => {
    setApi(new SilxApi(domain));
  }, [domain]);

  return <Provider api={api}>{children}</Provider>;
}

export default SilxProvider;
