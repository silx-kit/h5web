import { ReactNode, Suspense, useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ProviderContext } from '../../providers/context';
import ErrorFallback from '../../visualizer/ErrorFallback';
import ValueLoader from '../../visualizer/ValueLoader';

interface Props {
  resetKey?: unknown;
  loadingMessage?: string;
  children: ReactNode;
}

function VisBoundary(props: Props) {
  const { resetKey, loadingMessage, children } = props;
  const { valuesStore } = useContext(ProviderContext);

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
