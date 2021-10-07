import 'react-app-polyfill/stable';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import 'normalize.css';
import './styles.css';

import App from './App';

if (process.env.REACT_APP_DIST === 'true') {
  // Import distributed lib styles (can't use `import()` easily due to asynchronicity and lack of top-level `await` support)
  require('@h5web/lib/dist/style.css'); // eslint-disable-line @typescript-eslint/no-require-imports
}

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.querySelector('#root')
);
