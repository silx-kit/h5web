import React from 'react';
import { HDF5Link } from '../models/metadata';
import styles from './MetadataViewer.module.css';

interface Props {
  link?: HDF5Link;
}

function MetadataViewer(props: Props): JSX.Element {
  const { link } = props;

  return (
    <div className={styles.viewer}>
      {link ? (
        <p>Selected entity: {link.title}.</p>
      ) : (
        <p>No entity selected.</p>
      )}
    </div>
  );
}

export default MetadataViewer;
