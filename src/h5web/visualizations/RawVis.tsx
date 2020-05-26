import React from 'react';
import styles from './RawVis.module.css';
import { useVisProps } from '../dataset-visualizer/VisProvider';

function RawVis(): JSX.Element {
  const { rawValues } = useVisProps();
  return <pre className={styles.raw}>{JSON.stringify(rawValues, null, 2)}</pre>;
}

export default RawVis;
