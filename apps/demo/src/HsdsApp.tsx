import { App, assertEnvVar, HsdsProvider } from '@h5web/app';
import { useLocation } from 'react-router-dom';

import { getFeedbackURL } from './utils';

const URL = import.meta.env.VITE_HSDS_URL;
const USERNAME = import.meta.env.VITE_HSDS_USERNAME;
const PASSWORD = import.meta.env.VITE_HSDS_PASSWORD;
const SUBDOMAIN = import.meta.env.VITE_HSDS_SUBDOMAIN;
const FILEPATH = import.meta.env.VITE_HSDS_FALLBACK_FILEPATH;

function HsdsApp() {
  assertEnvVar(URL, 'VITE_HSDS_URL');
  assertEnvVar(USERNAME, 'VITE_HSDS_USERNAME');
  assertEnvVar(PASSWORD, 'VITE_HSDS_PASSWORD');
  assertEnvVar(SUBDOMAIN, 'VITE_HSDS_SUBDOMAIN');
  assertEnvVar(FILEPATH, 'VITE_HSDS_FALLBACK_FILEPATH');

  const query = new URLSearchParams(useLocation().search);
  const filepath = `${SUBDOMAIN}${query.get('file') || FILEPATH}`;

  return (
    <HsdsProvider
      url={URL}
      username={USERNAME}
      password={PASSWORD}
      filepath={filepath}
    >
      <App explorerOpen={!query.has('wide')} getFeedbackURL={getFeedbackURL} />
    </HsdsProvider>
  );
}

export default HsdsApp;
