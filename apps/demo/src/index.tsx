import 'react-app-polyfill/stable';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import 'normalize.css';
import './styles.css';

import DemoApp from './DemoApp';

if (process.env.REACT_APP_DIST === 'true') {
  // Import distributed app/lib styles (can't use `import()` easily due to asynchronicity and lack of top-level `await` support)
  require('@h5web/lib/dist/style.css'); // eslint-disable-line @typescript-eslint/no-require-imports
  require('@h5web/app/dist/style.css'); // eslint-disable-line @typescript-eslint/no-require-imports
}

ReactDOM.render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
  document.querySelector('#root')
);
