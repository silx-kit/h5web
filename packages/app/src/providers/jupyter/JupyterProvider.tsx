import type { ReactNode } from 'react';
import { useMemo } from 'react';

import Provider from '../Provider';
import { JupyterApi } from './jupyter-api';

interface Props {
  url: string;
  filepath: string;
  children: ReactNode;
}

function JupyterProvider(props: Props) {
  const { url, filepath, children } = props;
  const api = useMemo(() => new JupyterApi(url, filepath), [filepath, url]);

  return <Provider api={api}>{children}</Provider>;
}

export default JupyterProvider;
