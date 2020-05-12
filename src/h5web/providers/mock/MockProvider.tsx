import React, { ReactNode, useState, useEffect } from 'react';
import Provider from '../Provider';
import { MockApi } from './api';

interface Props {
  domain: string;
  children: ReactNode;
}

function MockProvider(props: Props): JSX.Element {
  const { domain, children } = props;
  const [api, setApi] = useState<MockApi>();

  useEffect(() => {
    setApi(new MockApi(domain));
  }, [domain]);

  return <Provider api={api}>{children}</Provider>;
}

export default MockProvider;
