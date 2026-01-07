import { type PropsWithChildren, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorFallback from '../ErrorFallback';
import { useDataContext } from '../providers/DataProvider';
import visualizerStyles from '../visualizer/Visualizer.module.css';
import ValueLoader from './ValueLoader';

interface Props {
  resetKey?: unknown;
  isSlice?: boolean;
}

function VisBoundary(props: PropsWithChildren<Props>) {
  const { resetKey, isSlice, children } = props;
  const { valuesStore } = useDataContext();

  return (
    <ErrorBoundary
      fallbackRender={(args) => (
        <ErrorFallback className={visualizerStyles.vis} {...args} />
      )}
      resetKeys={[resetKey]}
      onError={() => valuesStore.evictErrors()}
    >
      <Suspense fallback={<ValueLoader isSlice={isSlice} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default VisBoundary;
