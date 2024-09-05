import './styles.css'; // global styles

import { assertNonNull, supportBigIntToJSON } from '@h5web/app';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import DemoApp from './DemoApp';

supportBigIntToJSON(); // for `RawVis`

const rootElem = document.querySelector('#root');
assertNonNull(rootElem);

createRoot(rootElem).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);
