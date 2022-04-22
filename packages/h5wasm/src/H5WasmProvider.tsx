import { Provider } from '@h5web/app';
import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';

import { H5WasmApi } from './h5wasm-api';

interface Props {
  filename: string;
  buffer: ArrayBuffer;
  children: ReactNode;
}

function H5WasmProvider(props: Props) {
  const { filename, buffer, children } = props;

  const api = useMemo(
    () => new H5WasmApi(filename, buffer),
    [filename, buffer]
  );

  useEffect(() => {
    return () => void api.cleanUp();
  }, [api]);

  return <Provider api={api}>{children}</Provider>;
}

export default H5WasmProvider;
