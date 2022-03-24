import type { ReactNode } from 'react';
import { useMemo } from 'react';

import Provider from '../Provider';
import { H5WasmApi } from './h5wasm-api';

interface Props {
  url: string;
  children: ReactNode;
}

function H5WasmProvider(props: Props) {
  const { url, children } = props;

  const api = useMemo(() => new H5WasmApi(url), [url]);

  return <Provider api={api}>{children}</Provider>;
}

export default H5WasmProvider;
