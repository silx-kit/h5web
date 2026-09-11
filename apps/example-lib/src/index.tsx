import './styles.css'; // global styles

import { assertNonNull } from '@h5web/lib';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import DemoLib from './DemoLib';

const rootElem = document.querySelector('#root');
assertNonNull(rootElem);

createRoot(rootElem).render(
  <StrictMode>
    <DemoLib />
  </StrictMode>,
);
