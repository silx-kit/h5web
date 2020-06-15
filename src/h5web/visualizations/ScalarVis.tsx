import React from 'react';
import styles from './ScalarVis.module.css';

interface Props {
  value: number | string;
}

function ScalarVis(props: Props): JSX.Element {
  const { value } = props;
  return <div className={styles.scalar}>{value.toString()}</div>;
}

export default ScalarVis;
