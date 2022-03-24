import { App, H5WasmProvider } from '@h5web/app';
import { useLocation } from 'react-router-dom';

import { getFeedbackURL } from './utils';

const FILEPATH = import.meta.env.VITE_H5WASM_FALLBACK_FILEPATH as string;

function H5WasmApp() {
  const query = new URLSearchParams(useLocation().search);
  const filepath = query.get('file') || FILEPATH;

  return (
    <H5WasmProvider url={filepath}>
      <App
        startFullscreen={query.has('fullscreen')}
        getFeedbackURL={getFeedbackURL}
      />
    </H5WasmProvider>
  );
}

export default H5WasmApp;
