import { Fragment, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Profiler from '../Profiler';
import type { Entity } from '../providers/models';
import ErrorMessage from './ErrorMessage';
import type { VisDef } from '../vis-packs/models';
import ValueLoader from './ValueLoader';
import VisSelector from './VisSelector';
import styles from './Visualizer.module.css';

interface Props<T extends VisDef> {
  entity: Entity;
  activeVis: T | undefined;
  supportedVis: T[];
  onActiveVisChange: (vis: T) => void;
}

function Visualizer<T extends VisDef>(props: Props<T>) {
  const { entity, activeVis, supportedVis, onActiveVisChange } = props;

  if (!activeVis) {
    return <p className={styles.fallback}>Nothing to visualize</p>;
  }

  const { Container, Toolbar, ConfigProvider = Fragment } = activeVis;

  return (
    <div className={styles.visualizer}>
      <ConfigProvider>
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
            FallbackComponent={ErrorMessage}
          >
            <Suspense fallback={<ValueLoader />}>
              <Profiler id={activeVis.name}>
                <Container key={entity.path} entity={entity} />
              </Profiler>
            </Suspense>
          </ErrorBoundary>
        </div>
      </ConfigProvider>
    </div>
  );
}

export default Visualizer;
