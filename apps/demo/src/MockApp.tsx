import { App, MockProvider } from '@h5web/app';
import { useLocation } from 'react-router-dom';

import { getFeedbackURL } from './utils';

function MockApp() {
  const query = new URLSearchParams(useLocation().search);

  return (
    <MockProvider>
      <App
        startFullscreen={query.has('fullscreen')}
        getFeedbackURL={getFeedbackURL}
      />
    </MockProvider>
  );
}

export default MockApp;
