import React, { ReactElement } from 'react';
import { useLocation } from 'react-router-dom';
import { App, HsdsProvider } from '../packages/app';

const URL = process.env.REACT_APP_HSDS_URL || '';
const USERNAME = process.env.REACT_APP_HSDS_USERNAME || '';
const PASSWORD = process.env.REACT_APP_HSDS_PASSWORD || '';
const DOMAIN = process.env.REACT_APP_HSDS_DOMAIN || '';

function HsdsApp(): ReactElement {
  const query = new URLSearchParams(useLocation().search);
  const domain = query.get('domain');

  return (
    <HsdsProvider
      url={URL}
      username={USERNAME}
      password={PASSWORD}
      domain={domain || DOMAIN}
    >
      <App />
    </HsdsProvider>
  );
}

export default HsdsApp;
