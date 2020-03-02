import React from 'react';
import { HDF5Link, HDF5Collection, HDF5Metadata } from '../models/metadata';
import styles from './MetadataViewer.module.css';
import mockMetadata from '../mock/classic/metadata.json';

const ENTITY_TYPE: Record<HDF5Collection, string> = {
  [HDF5Collection.Datasets]: 'dataset',
  [HDF5Collection.Groups]: 'group',
  [HDF5Collection.Datatypes]: 'datatype',
};

interface Props {
  link?: HDF5Link;
}

function MetadataViewer(props: Props): JSX.Element {
  const { link } = props;

  if (!link) {
    return (
      <div className={styles.viewer}>
        <p>No entity selected.</p>
      </div>
    );
  }

  const { collection, title, id } = link;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const entity = (mockMetadata as HDF5Metadata)[collection]![id];

  return (
    <div className={styles.viewer}>
      <h2 className={styles.heading}>
        Metadata for {ENTITY_TYPE[collection]} <code>{title}</code>
      </h2>
      <pre>
        {JSON.stringify(
          entity,
          (key, value) => (key === 'links' ? undefined : value),
          2
        )}
      </pre>
    </div>
  );
}

export default MetadataViewer;
