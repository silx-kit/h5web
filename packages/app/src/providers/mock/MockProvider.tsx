import { type PropsWithChildren, useMemo } from 'react';

import { type DataProviderApi } from '../api';
import DataProvider from '../DataProvider';
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
