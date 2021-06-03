import { useLocation } from 'react-router-dom';
import { App } from '../packages/app';
import H5CoreProvider from '../h5web/providers/h5core/H5CoreProvider';

const URL = process.env.REACT_APP_H5CORE_URL || '';
const FILEPATH = process.env.REACT_APP_H5CORE_FALLBACK_FILEPATH || '';

function H5CoreApp() {
  const query = new URLSearchParams(useLocation().search);
  const filepath = query.get('file');

  return (
    <H5CoreProvider url={URL} filepath={filepath || FILEPATH}>
      <App />
    </H5CoreProvider>
  );
}

export default H5CoreApp;
