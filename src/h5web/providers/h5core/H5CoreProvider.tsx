import { ReactNode, useMemo } from 'react';
import { H5CoreApi } from './h5core-api';
import Provider from '../Provider';

interface Props {
  url: string;
  filepath: string;
  children: ReactNode;
}

function H5CoreProvider(props: Props) {
  const { url, filepath, children } = props;
  const api = useMemo(() => new H5CoreApi(url, filepath), [filepath, url]);

  return <Provider api={api}>{children}</Provider>;
}

export default H5CoreProvider;
