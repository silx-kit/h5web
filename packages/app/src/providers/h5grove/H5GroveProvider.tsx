import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';

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

  const [progress, setProgress] = useState(0);

  const api = useMemo(
    () => new H5GroveApi(url, filepath, axiosParams, setProgress),
    [filepath, url, axiosParams]
  );

  return (
    <Provider
      api={api}
      progress={progress}
      resetProgress={() => setProgress(0)}
    >
      {children}
    </Provider>
  );
}

export default H5GroveProvider;
