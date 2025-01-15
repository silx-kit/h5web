import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorFallback from '../ErrorFallback';
import { useDataContext } from '../providers/DataProvider';
import visualizerStyles from '../visualizer/Visualizer.module.css';
import ValueLoader from './ValueLoader';

interface Props {
  resetKey?: unknown;
  isSlice?: boolean;
  children: ReactNode;
}

function VisBoundary(props: Props) {
  const { resetKey, isSlice, children } = props;
  const { valuesStore } = useDataContext();

  return (
    <ErrorBoundary
      resetKeys={[resetKey]}
      // eslint-disable-next-line react/no-unstable-nested-components
      fallbackRender={(args) => (
        <ErrorFallback className={visualizerStyles.vis} {...args} />
      )}
      onError={() => valuesStore.evictErrors()}
    >
      <Suspense fallback={<ValueLoader isSlice={isSlice} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default VisBoundary;
