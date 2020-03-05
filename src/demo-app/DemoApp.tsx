import React from 'react';
import App from '../h5web/App';
import SilxProvider from '../h5web/providers/SilxProvider';

function DemoApp(): JSX.Element {
  return (
    <SilxProvider domain="bsa_002_000-integrate-sub">
      <App />
    </SilxProvider>
  );
}

export default DemoApp;
