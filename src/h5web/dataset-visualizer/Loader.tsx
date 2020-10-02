import React, { ReactElement } from 'react';
import styles from './Loader.module.css';

interface Props {
  message?: string;
}

function Loader(props: Props): ReactElement {
  const { message = 'Loading' } = props;

  return (
    <div className={styles.loader}>
      <div className={styles.grid}>
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
      <p>{message}...</p>
    </div>
  );
}

export default Loader;
