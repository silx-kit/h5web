import { ReactNode, useMemo } from 'react';
import { H5GroveApi } from './h5grove-api';
import Provider from '../Provider';

interface Props {
  url: string;
  filepath: string;
  children: ReactNode;
}

function H5GroveProvider(props: Props) {
  const { url, filepath, children } = props;
  const api = useMemo(() => new H5GroveApi(url, filepath), [filepath, url]);

  return <Provider api={api}>{children}</Provider>;
}

export default H5GroveProvider;
