import React from 'react';
import styles from './ScalarVis.module.css';
import { useScalarData } from '../dataset-visualizer/VisProvider';

function ScalarVis(): JSX.Element {
  const value = useScalarData();
  return <div className={styles.scalar}>{value.toString()}</div>;
}

export default ScalarVis;
