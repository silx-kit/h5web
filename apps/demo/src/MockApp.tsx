import { App, MockProvider } from '@h5web/app';
import { useLocation } from 'react-router-dom';

function MockApp() {
  const query = new URLSearchParams(useLocation().search);

  return (
    <MockProvider>
      <App startFullscreen={query.has('fullscreen')} />
    </MockProvider>
  );
}

export default MockApp;
