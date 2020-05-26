import React, { ReactElement, ReactNode } from 'react';

import styles from './Toolbar.module.css';

interface Props {
  children: ReactNode;
}

function Toolbar(props: Props): ReactElement {
  const { children } = props;
  return <div className={styles.toolbar}>{children}</div>;
}

export default Toolbar;
