import React, { ReactElement } from 'react';
import type { HDF5Group } from '../providers/models';
import styles from '../Visualizer.module.css';

interface Props {
  group: HDF5Group;
}

function NexusVisualizer(props: Props): ReactElement {
  const { group } = props;
  return (
    <div className={styles.visualizer}>
      <div className={styles.visBar} />
      <p className={styles.fallback}>NeXus group {group.id}</p>
    </div>
  );
}

export default NexusVisualizer;
