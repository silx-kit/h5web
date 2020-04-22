import React, { useMemo } from 'react';
import { HDF5Dataset } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import VisSelector from './VisSelector';
import { getSupportedVis, useActiveVis } from './utils';
import VisDisplay from './VisDisplay';
import VisToolbar from './VisToolbar';

interface Props {
  dataset?: HDF5Dataset;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { dataset } = props;

  const supportedVis = useMemo(() => getSupportedVis(dataset), [dataset]);
  const [activeVis, setActiveVis] = useActiveVis(supportedVis);

  return (
    <div className={styles.visualizer}>
      <div className={styles.toolbar}>
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={setActiveVis}
        />
        <VisToolbar vis={activeVis} />
      </div>
      <div className={styles.displayArea}>
        {dataset ? (
          activeVis && (
            <VisDisplay key={dataset.id} vis={activeVis} dataset={dataset} />
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
