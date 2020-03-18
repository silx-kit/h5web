import React, { ReactNode, useState, useEffect } from 'react';
import { SilxApi } from './api';
import Provider from '../Provider';

interface Props {
  domain: string;
  children: ReactNode;
}

function SilxProvider(props: Props): JSX.Element {
  const { domain, children } = props;
  const [api, setApi] = useState<SilxApi>();

  useEffect(() => {
    setApi(new SilxApi(domain));
  }, [domain]);

  return <Provider api={api}>{children}</Provider>;
}

export default SilxProvider;
