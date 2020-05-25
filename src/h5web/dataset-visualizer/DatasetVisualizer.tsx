import React, { useMemo } from 'react';
import { HDF5Dataset } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import VisSelector from './VisSelector';
import { getSupportedVis, useActiveVis } from './utils';
import VisDisplay from './VisDisplay';
import VisBar from './VisBar';
import VisProvider from './VisProvider';

interface Props {
  dataset?: HDF5Dataset;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { dataset } = props;
  const dimensionMapping = { x: 0, y: 1 };

  const supportedVis = useMemo(() => getSupportedVis(dataset), [dataset]);
  const [activeVis, setActiveVis] = useActiveVis(supportedVis);

  return (
    <div className={styles.visualizer}>
      <div className={styles.visBar}>
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={setActiveVis}
        />
        <div className={styles.toolbar}>
          <VisBar vis={activeVis} />
        </div>
      </div>
      <div className={styles.displayArea}>
        {dataset ? (
          activeVis && (
            <VisProvider
              key={dataset.id}
              mapping={dimensionMapping}
              dataset={dataset}
            >
              <VisDisplay vis={activeVis} dataset={dataset} />
            </VisProvider>
          )
        ) : (
          <p className={styles.noVis}>Nothing to visualize</p>
        )}
      </div>
    </div>
  );
}

// Optimise consecutive renders when selecting a link in the explorer
export default React.memo(DatasetVisualizer);
