import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import './styles.css'; // global styles

import DemoApp from './DemoApp';

ReactDOM.render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
  document.querySelector('#root')
);
