import { ReactElement, Suspense, useContext, useState } from 'react';
import styles from './Visualizer.module.css';
import { getDefaultEntity, getSupportedVis } from './utils';
import { VIS_DEFS, Vis } from '../visualizations';
import VisSelector from './VisSelector';
import ValueLoader from './ValueLoader';
import Profiler from '../Profiler';
import ErrorMessage from './ErrorMessage';
import { ErrorBoundary } from 'react-error-boundary';
import { ProviderContext } from '../providers/context';

interface Props {
  path: string;
}

function Visualizer(props: Props): ReactElement {
  const { path } = props;

  const { entitiesStore } = useContext(ProviderContext);
  const entity = entitiesStore.get(path);

  // Resolve any `default` attribute(s) to find entity to visualize
  const defaultEntity = getDefaultEntity(entity, entitiesStore);

  const supportedVis = getSupportedVis(defaultEntity);
  const [activeVis, setActiveVis] = useState<Vis>();

  // Update `activeVis` state as needed
  if (activeVis && supportedVis.length === 0) {
    setActiveVis(undefined);
  } else if (
    (!activeVis && supportedVis.length > 0) ||
    (activeVis && !supportedVis.includes(activeVis))
  ) {
    setActiveVis(supportedVis[supportedVis.length - 1]);
  }

  if (!activeVis) {
    return <p className={styles.fallback}>Nothing to visualize</p>;
  }

  const { Container, Toolbar } = activeVis && VIS_DEFS[activeVis];

  return (
    <div className={styles.visualizer}>
      <div className={styles.visBar}>
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={setActiveVis}
        />
        {Toolbar && <Toolbar />}
      </div>
      <div className={styles.displayArea}>
        <ErrorBoundary key={defaultEntity.uid} FallbackComponent={ErrorMessage}>
          <Suspense fallback={<ValueLoader />}>
            <Profiler id={activeVis}>
              <Container entity={defaultEntity} />
            </Profiler>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default Visualizer;
