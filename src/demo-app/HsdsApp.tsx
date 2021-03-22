import { useLocation } from 'react-router-dom';
import { App, HsdsProvider } from '../packages/app';

const URL = process.env.REACT_APP_HSDS_URL || '';
const USERNAME = process.env.REACT_APP_HSDS_USERNAME || '';
const PASSWORD = process.env.REACT_APP_HSDS_PASSWORD || '';
const FILEPATH = process.env.REACT_APP_HSDS_FALLBACK_FILEPATH || '';

function HsdsApp() {
  const query = new URLSearchParams(useLocation().search);
  const filepath = query.get('file');

  return (
    <HsdsProvider
      url={URL}
      username={USERNAME}
      password={PASSWORD}
      filepath={filepath || FILEPATH}
    >
      <App />
    </HsdsProvider>
  );
}

export default HsdsApp;
