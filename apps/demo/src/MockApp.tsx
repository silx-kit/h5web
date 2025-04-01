import { App, MockProvider } from '@h5web/app';
import { useSearchParams } from 'wouter';

import { getFeedbackURL } from './utils';

function MockApp() {
  const [searchParams] = useSearchParams();

  return (
    <MockProvider>
      <App
        sidebarOpen={!searchParams.has('wide')}
        getFeedbackURL={getFeedbackURL}
      />
    </MockProvider>
  );
}

export default MockApp;
