import React, { useContext } from 'react';
import styles from './RawVis.module.css';
import { VisContext } from '../dataset-visualizer/VisProvider';

function RawVis(): JSX.Element {
  const values = useContext(VisContext);
  return <pre className={styles.raw}>{JSON.stringify(values, null, 2)}</pre>;
}

export default RawVis;
