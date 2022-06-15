import type { AxiosRequestConfig } from 'axios';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import DataProvider from '../DataProvider';
import { H5GroveApi } from './h5grove-api';

interface Props {
  url: string;
  filepath: string;
  axiosConfig?: AxiosRequestConfig;
}

function H5GroveProvider(props: PropsWithChildren<Props>) {
  const { url, filepath, axiosConfig, children } = props;

  const api = useMemo(
    () => new H5GroveApi(url, filepath, axiosConfig),
    [filepath, url, axiosConfig]
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5GroveProvider;
