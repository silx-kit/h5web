import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import type { DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
import type { ViewerConfig } from '../models';
import { HsdsApi } from './hsds-api';

const DEFAULT_VIEWER_CONFIG: ViewerConfig = {
  slicingTiming: 250,
};

interface Props {
  url: string;
  username: string;
  password: string;
  filepath: string;
  getExportURL?: DataProviderApi['getExportURL'];
  viewerConfig?: Partial<ViewerConfig>;
}

function HsdsProvider(props: PropsWithChildren<Props>) {
  const {
    url,
    username,
    password,
    filepath,
    getExportURL,
    viewerConfig,
    children,
  } = props;

  const api = useMemo(
    () => new HsdsApi(url, username, password, filepath, getExportURL),
    [filepath, password, url, username, getExportURL],
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

export default HsdsProvider;
