import React from 'react';
import { HDF5Link } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import { useValues } from '../providers/hooks';

interface Props {
  link: HDF5Link;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { link } = props;
  const { title } = link;

  const values = useValues(link);

  return (
    <div className={styles.visualizer}>
      <h2 className={styles.heading}>
        Dataset <code>{title}</code>
      </h2>
      <pre>
        {JSON.stringify(values, null)
          .replace(/\[{2}/g, '[\n  [')
          .replace(/\]{2}/g, ']\n]')
          .replace(/\],\[/g, '],\n  [')
          .replace(/([0-9],)/g, '$1 ')}
      </pre>
    </div>
  );
}

export default DatasetVisualizer;
