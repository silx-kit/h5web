import { App, HsdsProvider } from '@h5web/app';
import { useLocation } from 'react-router-dom';

const URL = process.env.REACT_APP_HSDS_URL || '';
const USERNAME = process.env.REACT_APP_HSDS_USERNAME || '';
const PASSWORD = process.env.REACT_APP_HSDS_PASSWORD || '';
const FILEPATH = process.env.REACT_APP_HSDS_FALLBACK_FILEPATH || '';

function HsdsApp() {
  const query = new URLSearchParams(useLocation().search);
  const filepath = query.get('file') || FILEPATH;

  return (
    <HsdsProvider
      url={URL}
      username={USERNAME}
      password={PASSWORD}
      filepath={filepath}
    >
      <App />
    </HsdsProvider>
  );
}

export default HsdsApp;