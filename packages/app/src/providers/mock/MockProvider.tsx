import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import DataProvider from '../DataProvider';
import { MockApi } from './mock-api';

interface Props {}

function MockProvider(props: PropsWithChildren<Props>) {
  const { children } = props;
  const api = useMemo(() => new MockApi(), []);

  return <DataProvider api={api}>{children}</DataProvider>;
}

export default MockProvider;
