import { ReactNode, useMemo } from 'react';
import { JupyterStableApi } from './jupyter-api';
import { JupyterDevApi } from './jupyter-dev-api';
import Provider from '../Provider';

interface Props {
  url: string;
  filepath: string;
  children: ReactNode;
}

const JupyterApi =
  process.env.REACT_APP_JLAB_DEV_ENABLED === 'true'
    ? JupyterDevApi
    : JupyterStableApi;

function JupyterProvider(props: Props) {
  const { url, filepath, children } = props;
  const api = useMemo(() => new JupyterApi(url, filepath), [filepath, url]);

  return <Provider api={api}>{children}</Provider>;
}

export default JupyterProvider;
