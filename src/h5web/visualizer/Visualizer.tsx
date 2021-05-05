import { Suspense, useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Profiler from '../Profiler';
import type { Entity } from '../providers/models';
import ErrorFallback from './ErrorFallback';
import type { VisDef } from '../vis-packs/models';
import ValueLoader from './ValueLoader';
import VisSelector from './VisSelector';
import styles from './Visualizer.module.css';
import { ProviderContext } from '../providers/context';

interface Props<T extends VisDef> {
  entity: Entity;
  activeVis: T | undefined;
  supportedVis: T[];
  onActiveVisChange: (vis: T) => void;
}

function Visualizer<T extends VisDef>(props: Props<T>) {
  const { entity, activeVis, supportedVis, onActiveVisChange } = props;
  const { valuesStore } = useContext(ProviderContext);

  if (!activeVis) {
    return (
      <p className={styles.fallback}>
        No visualization available for this entity.
      </p>
    );
  }

  const { Container, Toolbar } = activeVis;

  return (
    <div className={styles.visualizer}>
      <div className={styles.visBar}>
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={onActiveVisChange}
        />
        {Toolbar && <Toolbar />}
      </div>

      <div className={styles.displayArea}>
        <ErrorBoundary
          resetKeys={[entity.path]}
          FallbackComponent={ErrorFallback}
          onError={() => valuesStore.evictCancelled()}
        >
          <Suspense fallback={<ValueLoader />}>
            <Profiler id={activeVis.name}>
              <Container key={entity.path} entity={entity} />
            </Profiler>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default Visualizer;
