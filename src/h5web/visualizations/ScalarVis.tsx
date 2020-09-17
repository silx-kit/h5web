import React from 'react';
import styles from './ScalarVis.module.css';
import type { HDF5Value } from '../providers/models';
import { assertNumOrStr } from './shared/utils';

interface Props {
  value: HDF5Value;
}

function ScalarVis(props: Props): JSX.Element {
  const { value } = props;
  assertNumOrStr(value);
  return <div className={styles.scalar}>{value.toString()}</div>;
}

export default ScalarVis;
