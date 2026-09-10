import { App } from '@h5web/app';
import { H5WasmBufferProvider, H5WasmLocalFileProvider } from '@h5web/h5wasm';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { useSearchParams } from 'wouter';

import { getFeedbackURL } from '../utils';
import DropZone from './DropZone';
import { type RemoteFile } from './models';
import { getPlugin } from './plugin-utils';

const DEVTOOLS = import.meta.env.VITE_QUERY_DEVTOOLS === 'true';

function H5WasmApp() {
  const [searchParams] = useSearchParams();
  const isWide = searchParams.has('wide');

  const [h5File, setH5File] = useState<File | RemoteFile>();

  if (!h5File) {
    return <DropZone onH5File={setH5File} />;
  }

  return (
    <DropZone onH5File={setH5File}>
      {h5File instanceof File ? (
        <H5WasmLocalFileProvider file={h5File} getPlugin={getPlugin}>
          <App sidebarOpen={!isWide} getFeedbackURL={getFeedbackURL} />
          {DEVTOOLS && <ReactQueryDevtools />}
        </H5WasmLocalFileProvider>
      ) : (
        <H5WasmBufferProvider {...h5File} getPlugin={getPlugin}>
          <App sidebarOpen={!isWide} getFeedbackURL={getFeedbackURL} />
          {DEVTOOLS && <ReactQueryDevtools />}
        </H5WasmBufferProvider>
      )}
    </DropZone>
  );
}

export default H5WasmApp;
