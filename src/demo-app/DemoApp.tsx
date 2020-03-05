import React from 'react';
import App from '../h5web/App';
import Silx from '../h5web/providers/silx/Silx';

function DemoApp(): JSX.Element {
  return (
    <Silx domain="bsa_002_000-integrate-sub">
      <App />
    </Silx>
  );
}

export default DemoApp;
