import { App } from '@h5web/app';
import { H5WasmBufferProvider, H5WasmLocalFileProvider } from '@h5web/h5wasm';
import { useState } from 'react';
import { useSearch } from 'wouter';

import { getFeedbackURL } from '../utils';
import DropZone from './DropZone';
import type { RemoteFile } from './models';
import { getPlugin } from './plugin-utils';

function H5WasmApp() {
  const query = new URLSearchParams(useSearch());
  const [h5File, setH5File] = useState<File | RemoteFile>();

  if (!h5File) {
    return <DropZone onH5File={setH5File} />;
  }

  return (
    <DropZone onH5File={setH5File}>
      {h5File instanceof File ? (
        <H5WasmLocalFileProvider file={h5File} getPlugin={getPlugin}>
          <App
            sidebarOpen={!query.has('wide')}
            getFeedbackURL={getFeedbackURL}
          />
        </H5WasmLocalFileProvider>
      ) : (
        <H5WasmBufferProvider {...h5File} getPlugin={getPlugin}>
          <App
            sidebarOpen={!query.has('wide')}
            getFeedbackURL={getFeedbackURL}
          />
        </H5WasmBufferProvider>
      )}
    </DropZone>
  );
}

export default H5WasmApp;
