import React from 'react';
import { HDF5HardLink } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import { useValue } from '../providers/hooks';

interface Props {
  link: HDF5HardLink;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { link } = props;
  const { title } = link;

  const value = useValue(link);

  return (
    <div className={styles.visualizer}>
      <h2 className={styles.heading}>
        Dataset <code>{title}</code>
      </h2>
      {value !== undefined && (
        <pre>
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
