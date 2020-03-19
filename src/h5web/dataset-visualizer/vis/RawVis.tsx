import React from 'react';
import styles from './RawVis.module.css';
import { HDF5Value } from '../../providers/models';

interface Props {
  data: HDF5Value;
}

function RawVis(props: Props): JSX.Element {
  const { data } = props;
  return <pre className={styles.raw}>{JSON.stringify(data, null, 2)}</pre>;
}

export default RawVis;
