import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import type { DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
import type { ViewerConfig } from '../models';
import { MockApi } from './mock-api';

const DEFAULT_VIEWER_CONFIG: ViewerConfig = {
  slicingTiming: 20,
};

interface Props {
  getExportURL?: DataProviderApi['getExportURL'];
  viewerConfig?: Partial<ViewerConfig>;
}

function MockProvider(props: PropsWithChildren<Props>) {
  const { getExportURL, viewerConfig, children } = props;

  const api = useMemo(() => new MockApi(getExportURL), [getExportURL]);

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

export default MockProvider;
