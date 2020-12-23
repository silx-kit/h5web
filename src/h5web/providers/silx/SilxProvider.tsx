import { ReactNode, ReactElement, useMemo } from 'react';
import { SilxApi } from './api';
import Provider from '../Provider';

interface Props {
  domain: string;
  children: ReactNode;
}

function SilxProvider(props: Props): ReactElement {
  const { domain, children } = props;

  const api = useMemo(() => new SilxApi(domain), [domain]);

  return <Provider api={api}>{children}</Provider>;
}

export default SilxProvider;
