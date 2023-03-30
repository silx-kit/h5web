import { App, MockProvider } from '@h5web/app';
import { useLocation } from 'react-router-dom';

import { getFeedbackURL } from './utils';

function MockApp() {
  const query = new URLSearchParams(useLocation().search);

  return (
    <MockProvider>
      <App sidebarOpen={!query.has('wide')} getFeedbackURL={getFeedbackURL} />
    </MockProvider>
  );
}

export default MockApp;
