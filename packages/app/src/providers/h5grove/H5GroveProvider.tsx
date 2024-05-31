import type { AxiosRequestConfig } from 'axios';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import type { DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
import type { ViewerConfig } from '../models';
import { H5GroveApi } from './h5grove-api';

const DEFAULT_VIEWER_CONFIG: ViewerConfig = {
  slicingTiming: 250,
};

interface Props {
  url: string;
  filepath: string;
  axiosConfig?: AxiosRequestConfig;
  getExportURL?: DataProviderApi['getExportURL'];
  viewerConfig?: Partial<ViewerConfig>;
}

function H5GroveProvider(props: PropsWithChildren<Props>) {
  const { url, filepath, axiosConfig, getExportURL, viewerConfig, children } =
    props;

  const api = useMemo(
    () => new H5GroveApi(url, filepath, axiosConfig, getExportURL),
    [filepath, url, axiosConfig, getExportURL],
  );

  const mergedViewerConfig = useMemo(
    () => ({ ...DEFAULT_VIEWER_CONFIG, ...viewerConfig }),
    [viewerConfig],
  );

  return (
    <DataProvider api={api} viewerConfig={mergedViewerConfig}>
      {children}
    </DataProvider>
  );
}

export default H5GroveProvider;
