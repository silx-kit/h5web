import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import DataProvider from '../DataProvider';
import { H5GroveApi } from './h5grove-api';

interface Props {
  url: string;
  filepath: string;
  axiosParams?: Record<string, string>;
}

function H5GroveProvider(props: PropsWithChildren<Props>) {
  const { url, filepath, axiosParams, children } = props;

  const api = useMemo(
    () => new H5GroveApi(url, filepath, axiosParams),
    [filepath, url, axiosParams]
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5GroveProvider;
