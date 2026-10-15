import {
  App,
  assertEnvVar,
  assertStr,
  buildBasicAuthHeader,
  createBasicFetcher,
  HsdsProvider,
} from '@h5web/app';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useMemo } from 'react';
import { useSearchParams } from 'wouter';

import { getFeedbackURL } from './utils';

const URL = import.meta.env.VITE_HSDS_URL;
const USERNAME = import.meta.env.VITE_HSDS_USERNAME;
const PASSWORD = import.meta.env.VITE_HSDS_PASSWORD;
const SUBDOMAIN = import.meta.env.VITE_HSDS_SUBDOMAIN;
const FALLBACK_DOMAIN = import.meta.env.VITE_HSDS_FALLBACK_DOMAIN;
const DEVTOOLS = import.meta.env.VITE_QUERY_DEVTOOLS === 'true';

function HsdsApp() {
  assertEnvVar(URL, 'VITE_HSDS_URL');
  assertStr(USERNAME);
  assertStr(PASSWORD);
  assertEnvVar(SUBDOMAIN, 'VITE_HSDS_SUBDOMAIN');
  assertEnvVar(FALLBACK_DOMAIN, 'VITE_HSDS_FALLBACK_DOMAIN');

  const [searchParams] = useSearchParams();
  const filepath = `${SUBDOMAIN}${searchParams.get('domain') || FALLBACK_DOMAIN}`;

  const fetcher = useMemo(() => {
    return USERNAME
      ? createBasicFetcher({
          headers: buildBasicAuthHeader(USERNAME, PASSWORD),
        })
      : undefined;
  }, []);

  return (
    <HsdsProvider url={URL} domain={filepath} fetcher={fetcher}>
      <App
        sidebarOpen={!searchParams.has('wide')}
        getFeedbackURL={getFeedbackURL}
      />
      {DEVTOOLS && <ReactQueryDevtools />}
    </HsdsProvider>
  );
}

export default HsdsApp;
