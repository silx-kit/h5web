import './styles.css'; // global styles

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import DemoApp from './DemoApp';

ReactDOM.render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
  document.querySelector('#root'),
);
