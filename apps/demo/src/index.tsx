import 'react-app-polyfill/stable';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import 'normalize.css';

if (process.env.REACT_APP_DIST === 'true') {
  require('@h5web/lib/dist/style.css');
  require('@h5web/app/dist/style.css');
}

import '@h5web/lib'; // ensures that the lib's styles come first in development
import DemoApp from './DemoApp';

ReactDOM.render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
  document.querySelector('#root')
);
