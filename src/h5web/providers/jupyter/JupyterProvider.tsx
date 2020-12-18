import React, { ReactNode, ReactElement, useMemo } from 'react';
import { JupyterApi } from './api';
import Provider from '../Provider';

interface Props {
  url: string;
  domain: string;
  children: ReactNode;
}

/* Provider of metadata and values by JupyterLab backend */
function JupyterProvider(props: Props): ReactElement {
  const { url, domain, children } = props;
  const api = useMemo(() => new JupyterApi(url, domain), [domain, url]);

  return <Provider api={api}>{children}</Provider>;
}

export default JupyterProvider;
