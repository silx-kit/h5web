import React from 'react';
import styles from './ScalarVis.module.css';
import { HDF5Value } from '../providers/models';

interface Props {
  data: HDF5Value;
}

function ScalarVis(props: Props): JSX.Element {
  const { data } = props;
  return <div className={styles.scalar}>{data.toString()}</div>;
}

export default ScalarVis;
