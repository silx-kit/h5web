import { type AxiosInstance } from 'axios';
import { type PropsWithChildren, useMemo } from 'react';

import { type DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
import { H5GroveApi } from './h5grove-api';

interface Props {
  filepath: string;
  axiosClient: AxiosInstance;
  resetKeys?: unknown[];
  getExportURL?: DataProviderApi['getExportURL'];
}

function H5GroveProvider(props: PropsWithChildren<Props>) {
  const {
    filepath,
    axiosClient,
    resetKeys = [],
    getExportURL,
    children,
  } = props;

  const api = useMemo(
    () => new H5GroveApi(filepath, axiosClient, getExportURL),
    [filepath, axiosClient, ...resetKeys, getExportURL], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default H5GroveProvider;
