import { App, HsdsProvider } from '@h5web/app';
import { useLocation } from 'react-router-dom';

import { getFeedbackURL } from './utils';

const URL = import.meta.env.VITE_HSDS_URL as string;
const USERNAME = import.meta.env.VITE_HSDS_USERNAME as string;
const PASSWORD = import.meta.env.VITE_HSDS_PASSWORD as string;
const SUBDOMAIN = import.meta.env.VITE_HSDS_SUBDOMAIN as string;
const FILEPATH = import.meta.env.VITE_HSDS_FALLBACK_FILEPATH as string;

function HsdsApp() {
  const query = new URLSearchParams(useLocation().search);
  const filepath = `${SUBDOMAIN}${query.get('file') || FILEPATH}`;

  return (
    <HsdsProvider
      url={URL}
      username={USERNAME}
      password={PASSWORD}
      filepath={filepath}
    >
      <App
        startFullscreen={query.has('fullscreen')}
        getFeedbackURL={getFeedbackURL}
      />
    </HsdsProvider>
  );
}

export default HsdsApp;
