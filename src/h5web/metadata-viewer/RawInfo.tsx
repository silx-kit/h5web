import React from 'react';
import { HDF5Link, HDF5Entity } from '../providers/models';

import styles from './MetadataViewer.module.css';

interface Props {
  link: HDF5Link;
  entity?: HDF5Entity;
}

function RawInfo(props: Props): JSX.Element {
  const { entity, link } = props;

  return (
    <div className={styles.rawInfo}>
      {link && (
        <details>
          <summary className={styles.rawHeading}>Raw link info</summary>
          <pre className={styles.rawContent}>
            {JSON.stringify(link, null, 2)}
          </pre>
        </details>
      )}
      {entity && (
        <details>
          <summary className={styles.rawHeading}>Raw entity info</summary>
          <pre className={styles.rawContent}>
            {JSON.stringify(entity, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default RawInfo;
