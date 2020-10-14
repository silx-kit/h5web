import React, { ReactElement, useState } from 'react';
import type { HDF5Dataset } from '../providers/models';
import styles from '../Visualizer.module.css';
import VisSelector from './VisSelector';
import VisDisplay from './VisDisplay';
import { Vis } from './models';
import { useSupportedVis } from './hooks';
import { VIS_DEFS } from '../visualizations';

interface Props {
  dataset: HDF5Dataset;
}

function DatasetVisualizer(props: Props): ReactElement {
  const { dataset } = props;

  const supportedVis = useSupportedVis(dataset);
  const [activeVis, setActiveVis] = useState(Vis.Raw); // raw vis supports all datasets

  if (!supportedVis.includes(activeVis)) {
    setActiveVis(supportedVis[supportedVis.length - 1]);
  }

  const VisToolbar = VIS_DEFS[activeVis].Toolbar;

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
        <VisDisplay
          key={`${dataset.id}_${activeVis}`} // reset local state when active vis or dataset changes
          activeVis={activeVis}
          dataset={dataset}
        />
      </div>
    </div>
  );
}

export default DatasetVisualizer;
