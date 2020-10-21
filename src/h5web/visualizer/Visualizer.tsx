import React, { ReactElement, useState } from 'react';
import { AsyncResourceContent } from 'use-async-resource';
import type { HDF5Entity } from '../providers/models';
import styles from './Visualizer.module.css';
import { useSupportedVis } from './hooks';
import { VIS_DEFS, Vis } from '../visualizations';
import VisSelector from './VisSelector';
import Loader from './Loader';

interface Props {
  entity?: HDF5Entity;
}

function Visualizer(props: Props): ReactElement {
  const { entity } = props;

  const supportedVis = useSupportedVis(entity);
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
          fallback={<Loader />}
          errorMessage={(err) => <p className={styles.error}>{err.message}</p>}
        >
          <Container key={entity.id} entity={entity} />
        </AsyncResourceContent>
      </div>
    </div>
  );
}

export default Visualizer;
