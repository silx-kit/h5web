import {
  App,
  assertEnvVar,
  buildBasicAuthHeader,
  createBasicFetcher,
  HsdsProvider,
} from '@h5web/app';
import { useMemo } from 'react';
import { useSearchParams } from 'wouter';

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

  const [searchParams] = useSearchParams();
  const filepath = `${SUBDOMAIN}${searchParams.get('file') || FILEPATH}`;

  const fetcher = useMemo(() => {
    return createBasicFetcher({
      headers: buildBasicAuthHeader(USERNAME, PASSWORD),
    });
  }, []);

  return (
    <HsdsProvider url={URL} filepath={filepath} fetcher={fetcher}>
      <App
        sidebarOpen={!searchParams.has('wide')}
        getFeedbackURL={getFeedbackURL}
      />
    </HsdsProvider>
  );
}

export default HsdsApp;
