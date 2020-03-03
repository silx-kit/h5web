import React from 'react';
import { HDF5Link, HDF5Collection } from '../providers/models';
import styles from './MetadataViewer.module.css';
import { useMetadata } from '../providers/hooks';

const ENTITY_TYPE: Record<HDF5Collection, string> = {
  [HDF5Collection.Datasets]: 'dataset',
  [HDF5Collection.Groups]: 'group',
  [HDF5Collection.Datatypes]: 'datatype',
};

interface Props {
  link: HDF5Link;
}

function MetadataViewer(props: Props): JSX.Element {
  const { link } = props;
  const { collection, title } = link;

  const metadata = useMetadata(link);

  return (
    <div className={styles.viewer}>
      <h2 className={styles.heading}>
        Metadata for {ENTITY_TYPE[collection]} <code>{title}</code>
      </h2>
      <pre>
        {JSON.stringify(
          metadata,
          (key, value) => (key === 'links' ? undefined : value),
          2
        )}
      </pre>
    </div>
  );
}

export default MetadataViewer;
