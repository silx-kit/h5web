import 'react-app-polyfill/stable';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import 'react-reflex/styles.css';
import 'normalize.css';
import './styles/index.css';

import DemoApp from './demo-app/DemoApp';

ReactDOM.render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
  document.querySelector('#root')
);
