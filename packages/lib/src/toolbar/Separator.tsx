import { type HTMLAttributes } from 'react';

import styles from './Toolbar.module.css';

function Separator(props: HTMLAttributes<HTMLSpanElement>) {
  return <span className={styles.sep} {...props} />;
}

export default Separator;
