import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import './styles.css';

import DemoApp from './DemoApp';

if (import.meta.env.PROD) {
  // Import distributed lib/app styles
  import('@h5web/app/dist/style-lib.css');
  import('@h5web/app/dist/style.css');
}

ReactDOM.render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
  document.querySelector('#root')
);
