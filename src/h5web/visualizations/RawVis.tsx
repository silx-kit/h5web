import React from 'react';
import styles from './RawVis.module.css';
import { useVisProps } from '../dataset-visualizer/VisProvider';

function RawVis(): JSX.Element {
  const { values } = useVisProps();
  return <pre className={styles.raw}>{JSON.stringify(values, null, 2)}</pre>;
}

export default RawVis;
