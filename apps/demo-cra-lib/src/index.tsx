import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import '@h5web/lib/src/styles.css';
// import '@h5web/lib/dist/style.css';
import './styles.css';

import App from './App';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.querySelector('#root')
);
