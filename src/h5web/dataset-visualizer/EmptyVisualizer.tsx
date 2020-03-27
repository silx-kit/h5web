import React from 'react';
import styles from './DatasetVisualizer.module.css';
import VisSelector from './VisSelector';

function EmptyVisualizer(): JSX.Element {
  return (
    <div className={styles.visualizer}>
      <VisSelector choices={[]} onChange={() => 0} />
      <div className={styles.displayArea}>No dataset selected.</div>
    </div>
  );
}

export default EmptyVisualizer;
