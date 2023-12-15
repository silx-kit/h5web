import { App } from '@h5web/app';
import { H5WasmProvider } from '@h5web/h5wasm';
import { useState } from 'react';
import { useSearch } from 'wouter';

import { getFeedbackURL } from '../utils';
import DropZone from './DropZone';
import type { H5File } from './models';
import { getPlugin } from './plugin-utils';

function H5WasmApp() {
  const query = new URLSearchParams(useSearch());
  const [h5File, setH5File] = useState<H5File>();

  if (!h5File) {
    return <DropZone onH5File={setH5File} />;
  }

  return (
    <H5WasmProvider {...h5File} getPlugin={getPlugin}>
      <App sidebarOpen={!query.has('wide')} getFeedbackURL={getFeedbackURL} />
    </H5WasmProvider>
  );
}

export default H5WasmApp;
