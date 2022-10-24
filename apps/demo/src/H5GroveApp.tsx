import { App, H5GroveProvider, assertEnvVar } from '@h5web/app';
import { useLocation } from 'react-router-dom';

import { getFeedbackURL } from './utils';

const URL = import.meta.env.VITE_H5GROVE_URL;
const FILEPATH = import.meta.env.VITE_H5GROVE_FALLBACK_FILEPATH;

function H5GroveApp() {
  assertEnvVar(URL, 'VITE_H5GROVE_URL');
  assertEnvVar(FILEPATH, 'VITE_H5GROVE_FALLBACK_FILEPATH');

  const query = new URLSearchParams(useLocation().search);
  const filepath = query.get('file') || FILEPATH;

  return (
    <H5GroveProvider
      url={URL}
      filepath={filepath}
      axiosConfig={{ params: { file: filepath } }}
    >
      <App explorerOpen={!query.has('wide')} getFeedbackURL={getFeedbackURL} />
    </H5GroveProvider>
  );
}

export default H5GroveApp;
