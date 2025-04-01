import { App, assertEnvVar, H5GroveProvider } from '@h5web/app';
import { useMemo } from 'react';
import { useSearchParams } from 'wouter';

import { getFeedbackURL } from './utils';

const URL = import.meta.env.VITE_H5GROVE_URL;
const FILEPATH = import.meta.env.VITE_H5GROVE_FALLBACK_FILEPATH;

function H5GroveApp() {
  assertEnvVar(URL, 'VITE_H5GROVE_URL');
  assertEnvVar(FILEPATH, 'VITE_H5GROVE_FALLBACK_FILEPATH');

  const [searchParams] = useSearchParams();
  const filepath = searchParams.get('file') || FILEPATH;

  return (
    <H5GroveProvider
      url={URL}
      filepath={filepath}
      axiosConfig={useMemo(() => ({ params: { file: filepath } }), [filepath])}
    >
      <App
        sidebarOpen={!searchParams.has('wide')}
        getFeedbackURL={getFeedbackURL}
      />
    </H5GroveProvider>
  );
}

export default H5GroveApp;
