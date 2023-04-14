import { type AxiosRequestConfig } from 'axios';
import { type PropsWithChildren, useMemo } from 'react';

import { type DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
import { H5GroveApi } from './h5grove-api';

interface Props {
  url: string;
  filepath: string;
  axiosConfig?: AxiosRequestConfig;
  getExportURL?: DataProviderApi['getExportURL'];
}

function H5GroveProvider(props: PropsWithChildren<Props>) {
  const { url, filepath, axiosConfig, getExportURL, children } = props;

  const api = useMemo(
    () => new H5GroveApi(url, filepath, axiosConfig, getExportURL),
    [filepath, url, axiosConfig, getExportURL]
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5GroveProvider;
