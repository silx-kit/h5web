import React from 'react';
import { HDF5Link } from '../models/metadata';
import styles from './DatasetVisualizer.module.css';

interface Props {
  dataset?: HDF5Link;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { dataset } = props;

  return (
    <div className={styles.visualizer}>
      {dataset ? (
        <p>Selected dataset: {dataset.title}.</p>
      ) : (
        <p>No dataset selected.</p>
      )}
    </div>
  );
}

export default DatasetVisualizer;
