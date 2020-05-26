import React from 'react';
import styles from './ScalarVis.module.css';
import { useVisProps } from '../dataset-visualizer/VisProvider';

function ScalarVis(): JSX.Element {
  const { rawValues } = useVisProps();
  return <div className={styles.scalar}>{rawValues.toString()}</div>;
}

export default ScalarVis;
