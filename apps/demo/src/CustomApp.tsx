import { ErrorFallback, VisConfigProvider, Visualizer } from '@h5web/app';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function CustomApp() {
  return (
    <VisConfigProvider>
      <div style={{ display: 'flex', height: '100%' }}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback="Loading...">
            <Visualizer path="/nexus_entry" />
          </Suspense>
        </ErrorBoundary>
      </div>
    </VisConfigProvider>
  );
}

export default CustomApp;
