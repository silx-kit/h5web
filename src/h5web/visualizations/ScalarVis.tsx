import React from 'react';
import styles from './ScalarVis.module.css';
import { useVisProps } from '../dataset-visualizer/VisProvider';

function ScalarVis(): JSX.Element {
  const { values } = useVisProps();
  return <div className={styles.scalar}>{values.toString()}</div>;
}

export default ScalarVis;
