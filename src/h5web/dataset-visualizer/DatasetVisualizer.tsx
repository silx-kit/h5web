import React from 'react';
import { HDF5Entity, HDF5Collection } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import { useValue } from '../providers/hooks';

interface Props {
  dataset: HDF5Entity<HDF5Collection.Datasets>;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { dataset } = props;
  const { id } = dataset;

  const value = useValue(id);

  return (
    <div className={styles.visualizer}>
      {value !== undefined && (
        <pre className={styles.raw}>
          {JSON.stringify(value, null)
            .replace(/\[{2}/g, '[\n  [')
            .replace(/\]{2}/g, ']\n]')
            .replace(/\],\[/g, '],\n  [')
            .replace(/([0-9],)/g, '$1 ')}
        </pre>
      )}
    </div>
  );
}

export default DatasetVisualizer;
