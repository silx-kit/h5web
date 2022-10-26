import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import DataProvider from '../DataProvider';
import type { DataProviderApi } from '../api';
import { MockApi } from './mock-api';

interface Props {
  getExportURL?: DataProviderApi['getExportURL'];
}

function MockProvider(props: PropsWithChildren<Props>) {
  const { getExportURL, children } = props;

  const api = useMemo(() => new MockApi(getExportURL), [getExportURL]);

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default MockProvider;
