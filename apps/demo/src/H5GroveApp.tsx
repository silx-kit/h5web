import { App, H5GroveProvider } from '@h5web/app';
import { useLocation } from 'react-router-dom';

import { getFeedbackURL } from './utils';

const URL = import.meta.env.VITE_H5GROVE_URL as string;
const FILEPATH = import.meta.env.VITE_H5GROVE_FALLBACK_FILEPATH as string;

function H5GroveApp() {
  const query = new URLSearchParams(useLocation().search);
  const filepath = query.get('file') || FILEPATH;

  return (
    <H5GroveProvider
      url={URL}
      filepath={filepath}
      axiosConfig={{ params: { file: filepath } }}
    >
      <App
        explorerOpen={!query.has('wide')}
        getFeedbackURL={getFeedbackURL}
        disableDarkMode
      />
    </H5GroveProvider>
  );
}

export default H5GroveApp;
