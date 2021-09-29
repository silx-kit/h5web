import 'react-app-polyfill/stable';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import 'normalize.css';

if (process.env.REACT_APP_DIST === 'true') {
  require('@h5web/app/dist/style.css');
}

require('./styles/index.css'); // `require` syntax to maintain correct order

import DemoApp from './DemoApp';

ReactDOM.render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
  document.querySelector('#root')
);
