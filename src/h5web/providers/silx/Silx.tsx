import React, { ReactNode, useState, useEffect } from 'react';
import SilxProvider from './SilxProvider';
import { SilxApi } from './api';

interface Props {
  domain: string;
  children: ReactNode;
}

function Silx(props: Props): JSX.Element {
  const { domain, children } = props;
  const [api, setApi] = useState<SilxApi>();

  useEffect(() => {
    setApi(new SilxApi(domain));
  }, [domain]);

  if (!api) {
    return <></>;
  }

  return <SilxProvider api={api}>{children}</SilxProvider>;
}

export default Silx;
