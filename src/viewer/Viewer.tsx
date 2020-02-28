import React from 'react';
import { HDF5Link } from '../models/metadata';
import styles from './Viewer.module.css';

interface Props {
  entity?: HDF5Link;
}

function Viewer(props: Props): JSX.Element {
  const { entity } = props;

  return (
    <div className={styles.viewer}>
      {entity ? (
        <p>Selected entity: {entity.title}.</p>
      ) : (
        <p>No entity selected.</p>
      )}
    </div>
  );
}

export default Viewer;
