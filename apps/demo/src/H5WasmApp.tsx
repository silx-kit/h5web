import { App, H5WasmProvider } from '@h5web/app';
import { useLocation } from 'react-router-dom';

import { getFeedbackURL } from './utils';

const FILEPATH = import.meta.env.VITE_H5WASM_FALLBACK_FILEPATH as string;
// type H5WasmSourceType = string | File;

function H5WasmApp() {
  const query = new URLSearchParams(useLocation().search);
  const source = query.get('url') || FILEPATH;

  return (
    <H5WasmProvider source={source}>
      <App
        startFullscreen={query.has('fullscreen')}
        getFeedbackURL={getFeedbackURL}
      />
    </H5WasmProvider>
  );
}

export default H5WasmApp;
