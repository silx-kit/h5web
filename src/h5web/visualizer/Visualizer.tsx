import React, { ReactElement, useState } from 'react';
import { AsyncResourceContent } from 'use-async-resource';
import type { Entity } from '../providers/models';
import styles from './Visualizer.module.css';
import { getSupportedVis } from './utils';
import { VIS_DEFS, Vis } from '../visualizations';
import VisSelector from './VisSelector';
import Loader from './Loader';
import Profiler from '../Profiler';

interface Props {
  entity?: Entity;
}

function Visualizer(props: Props): ReactElement {
  const { entity } = props;

  const { supportedVis, error } = getSupportedVis(entity);
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

  if (error) {
    return <p className={styles.error}>{error.message}</p>;
  }

  if (!entity || !activeVis) {
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
        <AsyncResourceContent
          key={entity.uid}
          fallback={<Loader />}
          errorMessage={(err: Error) => (
            <p className={styles.error}>{err.message}</p>
          )}
        >
          <Profiler id={activeVis}>
            <Container entity={entity} />
          </Profiler>
        </AsyncResourceContent>
      </div>
    </div>
  );
}

export default Visualizer;
