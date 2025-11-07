import { type HTMLAttributes } from 'react';

import styles from './MenuSeparator.module.css';

function MenuSeparator(props: HTMLAttributes<HTMLSpanElement>) {
  return <span className={styles.sep} {...props} />;
}

export default MenuSeparator;
