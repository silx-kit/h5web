import React from 'react';
import { HDF5Link, HDF5Entity } from '../providers/models';

import styles from './RawInspector.module.css';

interface Props {
  data: HDF5Link | HDF5Entity;
}

function RawInspector(props: Props): JSX.Element {
  const { data } = props;

  return (
    <details>
      <summary className={styles.heading}>Inspect</summary>
      <pre className={styles.content}>{JSON.stringify(data, null, 2)}</pre>
    </details>
  );
}

export default RawInspector;
