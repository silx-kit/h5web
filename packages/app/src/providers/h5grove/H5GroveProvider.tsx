import type { ReactNode } from 'react';
import { useMemo } from 'react';

import Provider from '../Provider';
import { H5GroveApi } from './h5grove-api';

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
