import React, { useState, useMemo } from 'react';
import { HDF5Entity, HDF5Collection } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import { useValue } from '../providers/hooks';
import VisSelector from './VisSelector';
import { Vis } from './models';
import { getSupportedVis } from './utils';
import VisDisplay from './VisDisplay';

interface Props {
  dataset: HDF5Entity<HDF5Collection.Datasets>;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { dataset } = props;

  const value = useValue(dataset.id);

  const supportedVis = useMemo(() => getSupportedVis(dataset), [dataset]);
  const [activeVis, setActiveVis] = useState<Vis>(supportedVis[0]);

  return (
    <div className={styles.visualizer}>
      <VisSelector
        activeVis={activeVis}
        choices={supportedVis}
        onChange={setActiveVis}
      />

      {value !== undefined && (
        <VisDisplay vis={activeVis} dataset={dataset} value={value} />
      )}
    </div>
  );
}

export default DatasetVisualizer;
