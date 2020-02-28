import React from 'react';
import { HDF5Link, HDF5Values } from '../models/metadata';
import mockValues from '../mock/values.json';
import styles from './DatasetVisualizer.module.css';

interface Props {
  link?: HDF5Link;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { link } = props;

  if (!link) {
    return (
      <div className={styles.visualizer}>
        <p>No dataset selected.</p>
      </div>
    );
  }

  const { title, id } = link;
  const dataset = (mockValues as HDF5Values)[id];

  return (
    <div className={styles.visualizer}>
      <h2 className={styles.heading}>
        Dataset <code>{title}</code>
      </h2>
      <pre>
        {JSON.stringify(dataset, null)
          .replace(/\[{2}/g, '[\n  [')
          .replace(/\]{2}/g, ']\n]')
          .replace(/\],\[/g, '],\n  [')
          .replace(/([0-9],)/g, '$1 ')}
      </pre>
    </div>
  );
}

export default DatasetVisualizer;
