import React, { ReactElement } from 'react';
import { useLocation } from 'react-router-dom';
import JupyterProvider from '../h5web/providers/jupyter/JupyterProvider';
import { App } from '../packages/app';

const URL = process.env.REACT_APP_JLAB_URL || '';
const DOMAIN = process.env.REACT_APP_JLAB_FALLBACK_DOMAIN || '';

function JupyterApp(): ReactElement {
  const query = new URLSearchParams(useLocation().search);
  const domain = query.get('domain');

  return (
    <JupyterProvider url={URL} domain={domain || DOMAIN}>
      <App />
    </JupyterProvider>
  );
}

export default JupyterApp;
