import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

if (process.env.REACT_APP_DIST === 'true') {
  require('@h5web/lib/dist/style.css');
}

require('./styles.css'); // `require` syntax to maintain correct order

import App from './App';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.querySelector('#root')
);
