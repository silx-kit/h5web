import React, { ReactNode, useState, useEffect } from 'react';
import HsdsProvider from './HsdsProvider';
import { HsdsApi } from './api';

interface Props {
  domain: string;
  children: ReactNode;
}

function Hsds(props: Props): JSX.Element {
  const { domain, children } = props;
  const [api, setApi] = useState<HsdsApi>();

  useEffect(() => {
    setApi(new HsdsApi(domain));
  }, [domain]);

  if (!api) {
    return <></>;
  }

  return <HsdsProvider api={api}>{children}</HsdsProvider>;
}

export default Hsds;
