import React, { useState, ReactElement, useMemo } from 'react';
import { HDF5Dataset } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import VisSelector from './VisSelector';
import { getSupportedVis } from './utils';
import VisDisplay from './VisDisplay';
import { Vis } from './models';
import { VIS_DEFS } from '../visualizations';

interface Props {
  dataset?: HDF5Dataset;
}

function DatasetVisualizer(props: Props): ReactElement {
  const { dataset } = props;

  const supportedVis = useMemo(() => getSupportedVis(dataset), [dataset]);
  const [prevDataset, setPrevDataset] = useState<HDF5Dataset>();
  const [activeVis, setActiveVis] = useState<Vis>();

  // Update active vis when dataset changes
  // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
  if (dataset !== prevDataset) {
    setPrevDataset(dataset);
    setActiveVis(
      activeVis && supportedVis.includes(activeVis)
        ? activeVis
        : supportedVis[supportedVis.length - 1]
    );
  }

  const VisToolbar = activeVis && VIS_DEFS[activeVis].Toolbar;

  return (
    <div className={styles.visualizer}>
      <div className={styles.visBar}>
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={setActiveVis}
        />
        {VisToolbar && <VisToolbar />}
      </div>
      <div className={styles.displayArea}>
        {dataset && activeVis ? (
          <VisDisplay
            key={dataset.id}
            activeVis={activeVis}
            dataset={dataset}
          />
        ) : (
          <p className={styles.noVis}>Nothing to visualize</p>
        )}
      </div>
    </div>
  );
}

// Optimise consecutive renders when selecting a link in the explorer
export default React.memo(DatasetVisualizer);
