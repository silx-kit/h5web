import React, { useState, useMemo } from 'react';
import { HDF5Dataset } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import { useValue } from '../providers/hooks';
import VisSelector from './VisSelector';
import { Vis } from './models';
import { getSupportedVis } from './utils';
import VisDisplay from './VisDisplay';

interface Props {
  dataset: HDF5Dataset;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { dataset } = props;

  const value = useValue(dataset.id);

  const supportedVis = useMemo(() => getSupportedVis(dataset), [dataset]);
  const [activeVis, setActiveVis] = useState<Vis>(
    supportedVis[supportedVis.length - 1]
  );

  return (
    <div className={styles.visualizer}>
      <VisSelector
        activeVis={activeVis}
        choices={supportedVis}
        onChange={setActiveVis}
      />
      <div className={styles.displayArea}>
        {value !== undefined && (
          <VisDisplay vis={activeVis} dataset={dataset} value={value} />
        )}
      </div>
    </div>
  );
}

export default DatasetVisualizer;
