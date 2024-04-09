import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorFallback from '../ErrorFallback';
import { useDataContext } from '../providers/DataProvider';
import visualizerStyles from '../visualizer/Visualizer.module.css';
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
      fallbackRender={(args) => (
        <ErrorFallback className={visualizerStyles.vis} {...args} />
      )}
      onError={() => valuesStore.evictCancelled()}
    >
      <Suspense fallback={<ValueLoader message={loadingMessage} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default VisBoundary;
