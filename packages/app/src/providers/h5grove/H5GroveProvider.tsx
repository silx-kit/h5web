import type { ReactNode } from 'react';
import { useMemo } from 'react';

import Provider from '../Provider';
import { H5GroveApi } from './h5grove-api';

interface Props {
  url: string;
  filepath: string;
  axiosParams?: Record<string, string>;
  children: ReactNode;
}

function H5GroveProvider(props: Props) {
  const { url, filepath, axiosParams, children } = props;

  const api = useMemo(
    () => new H5GroveApi(url, filepath, axiosParams),
    [filepath, url, axiosParams]
  );

  return <Provider api={api}>{children}</Provider>;
}

export default H5GroveProvider;
