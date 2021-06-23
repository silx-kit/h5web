import { useLocation } from 'react-router-dom';
import { App } from '../packages/app';
import H5GroveProvider from '../h5web/providers/h5grove/H5GroveProvider';

const URL = process.env.REACT_APP_H5GROVE_URL || '';
const FILEPATH = process.env.REACT_APP_H5GROVE_FALLBACK_FILEPATH || '';

function H5GroveApp() {
  const query = new URLSearchParams(useLocation().search);
  const filepath = query.get('file');

  return (
    <H5GroveProvider url={URL} filepath={filepath || FILEPATH}>
      <App />
    </H5GroveProvider>
  );
}

export default H5GroveApp;
