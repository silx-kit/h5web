import { ReactNode, useMemo } from 'react';
import { JupyterApi } from './api';
import Provider from '../Provider';

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
