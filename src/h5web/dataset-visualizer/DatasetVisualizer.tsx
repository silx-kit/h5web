import React, { useState, useMemo } from 'react';
import { HDF5Dataset } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import VisSelector from './VisSelector';
import { Vis } from './models';
import { getSupportedVis } from './utils';
import VisDisplay from './VisDisplay';

interface Props {
  dataset?: HDF5Dataset;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { dataset } = props;

  const supportedVis = useMemo(() => getSupportedVis(dataset), [dataset]);
  const [activeVis, setActiveVis] = useState<Vis | undefined>(
    dataset && supportedVis[supportedVis.length - 1]
  );

  return (
    <div className={styles.visualizer}>
      <VisSelector
        activeVis={activeVis}
        choices={supportedVis}
        onChange={setActiveVis}
      />
      <div className={styles.displayArea}>
        {dataset && activeVis ? (
          <VisDisplay vis={activeVis} dataset={dataset} />
        ) : (
          <p className={styles.noVis}>Nothing to visualize</p>
        )}
      </div>
    </div>
  );
}

// Optimise consecutive renders when selecting a link in the explorer
export default React.memo(DatasetVisualizer);
