import { App, MockProvider } from '@h5web/app';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useSearchParams } from 'wouter';

import { getFeedbackURL } from './utils';

const DEVTOOLS = import.meta.env.VITE_QUERY_DEVTOOLS === 'true';

function MockApp() {
  const [searchParams] = useSearchParams();

  return (
    <MockProvider>
      <App
        sidebarOpen={!searchParams.has('wide')}
        getFeedbackURL={getFeedbackURL}
      />
      {DEVTOOLS && <ReactQueryDevtools />}
    </MockProvider>
  );
}

export default MockApp;
