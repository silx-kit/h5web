import { App, MockProvider } from '@h5web/app';
import { useSearch } from 'wouter';

import CustomApp from './CustomApp';
import { getFeedbackURL } from './utils';

function MockApp() {
  const query = new URLSearchParams(useSearch());

  if (query.has('custom')) {
    return (
      <MockProvider>
        <CustomApp />
      </MockProvider>
    );
  }

  return (
    <MockProvider>
      <App sidebarOpen={!query.has('wide')} getFeedbackURL={getFeedbackURL} />
    </MockProvider>
  );
}

export default MockApp;
