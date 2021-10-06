import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import 'normalize.css';
import './styles.css';

if (process.env.REACT_APP_DIST === 'true') {
  require('@h5web/lib/dist/style.css');
}

import App from './App';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.querySelector('#root')
);
