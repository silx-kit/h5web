import { App } from '@h5web/app';
import { H5WasmProvider } from '@h5web/h5wasm';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { getFeedbackURL } from '../utils';
import DropZone from './DropZone';
import type { H5File } from './models';

function H5WasmApp() {
  const query = new URLSearchParams(useLocation().search);
  const [h5File, setH5File] = useState<H5File>();

  if (!h5File) {
    return <DropZone onChange={setH5File} />;
  }

  return (
    <H5WasmProvider {...h5File}>
      <App explorerOpen={!query.has('wide')} getFeedbackURL={getFeedbackURL} />
    </H5WasmProvider>
  );
}

export default H5WasmApp;
