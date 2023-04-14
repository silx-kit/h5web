import { type ReactNode, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorFallback from '../ErrorFallback';
import { useDataContext } from '../providers/DataProvider';
import ValueLoader from './ValueLoader';

interface Props {
  resetKey?: unknown;
  loadingMessage?: string;
  children: ReactNode;
}

function VisBoundary(props: Props) {
  const { resetKey, loadingMessage, children } = props;
  const { valuesStore } = useDataContext();

  return (
    <ErrorBoundary
      resetKeys={[resetKey]}
      FallbackComponent={ErrorFallback}
      onError={() => valuesStore.evictCancelled()}
    >
      <Suspense fallback={<ValueLoader message={loadingMessage} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default VisBoundary;
