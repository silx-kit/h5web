import { App, JupyterProvider } from '@h5web/app';
import { useLocation } from 'react-router-dom';

const URL = process.env.REACT_APP_JLAB_URL || '';
const FILEPATH = process.env.REACT_APP_JLAB_FALLBACK_FILEPATH || '';

function JupyterApp() {
  const query = new URLSearchParams(useLocation().search);
  const filepath = query.get('file');

  return (
    <JupyterProvider url={URL} filepath={filepath || FILEPATH}>
      <App />
    </JupyterProvider>
  );
}

export default JupyterApp;
