import 'react-app-polyfill/stable';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import 'normalize.css';
import '@h5web/app/src/styles.css';
// import '@h5web/app/dist/style.css';
import './styles/index.css';

import DemoApp from './DemoApp';

ReactDOM.render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
  document.querySelector('#root')
);
