import type { AxiosRequestConfig } from 'axios';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import type { DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
import { H5GroveApi } from './h5grove-api';

interface Props {
  url: string;
  filepath: string;
  axiosConfig?: AxiosRequestConfig;
  resetKeys?: unknown[];
  getExportURL?: DataProviderApi['getExportURL'];
}

function H5GroveProvider(props: PropsWithChildren<Props>) {
  const {
    url,
    filepath,
    axiosConfig,
    resetKeys = [],
    getExportURL,
    children,
  } = props;

  const api = useMemo(
    () => new H5GroveApi(url, filepath, axiosConfig, getExportURL),
    [filepath, url, axiosConfig, ...resetKeys, getExportURL], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5GroveProvider;
