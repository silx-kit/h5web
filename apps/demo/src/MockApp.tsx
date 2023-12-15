import { App, MockProvider } from '@h5web/app';
import { useSearch } from 'wouter';

import { getFeedbackURL } from './utils';

function MockApp() {
  const query = new URLSearchParams(useSearch());

  return (
    <MockProvider>
      <App sidebarOpen={!query.has('wide')} getFeedbackURL={getFeedbackURL} />
    </MockProvider>
  );
}

export default MockApp;
