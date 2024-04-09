import { App } from '@h5web/app';
import { H5WasmLocalFileProvider, H5WasmProvider } from '@h5web/h5wasm';
import { useState } from 'react';
import { useSearch } from 'wouter';

import { getFeedbackURL } from '../utils';
import DropZone from './DropZone';
import styles from './H5WasmApp.module.css';
import type { RemoteFile } from './models';
import { getPlugin } from './plugin-utils';
import UrlForm from './UrlForm';

function H5WasmApp() {
  const query = new URLSearchParams(useSearch());
  const [h5File, setH5File] = useState<File | RemoteFile>();

  if (!h5File) {
    return (
      <DropZone onDrop={setH5File}>
        <p className={styles.fromUrl}>
          You may also provide a URL if your file is hosted remotely:
        </p>
        <UrlForm onLoad={setH5File} />
      </DropZone>
    );
  }

  if (h5File instanceof File) {
    return (
      <H5WasmLocalFileProvider file={h5File} getPlugin={getPlugin}>
        <App sidebarOpen={!query.has('wide')} getFeedbackURL={getFeedbackURL} />
      </H5WasmLocalFileProvider>
    );
  }

  return (
    <H5WasmProvider {...h5File} getPlugin={getPlugin}>
      <App sidebarOpen={!query.has('wide')} getFeedbackURL={getFeedbackURL} />
    </H5WasmProvider>
  );
}

export default H5WasmApp;
