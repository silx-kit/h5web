import './styles.css'; // global styles

import { assertNonNull, enableBigIntSerialization } from '@h5web/app';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import DemoApp from './DemoApp';

enableBigIntSerialization(); // for `RawVis` and `MetadataViewer`

const rootElem = document.querySelector('#root');
assertNonNull(rootElem);

createRoot(rootElem).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);
