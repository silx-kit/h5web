import { ReactNode, useMemo } from 'react';
import Provider from '../Provider';
import { MockApi } from './mock-api';

interface Props {
  children: ReactNode;
}

function MockProvider(props: Props) {
  const { children } = props;
  const api = useMemo(() => new MockApi(), []);

  return <Provider api={api}>{children}</Provider>;
}

export default MockProvider;
