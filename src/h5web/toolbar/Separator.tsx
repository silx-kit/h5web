import type { ReactElement } from 'react';
import styles from './Toolbar.module.css';

function Separator(): ReactElement {
  return <span className={styles.sep} />;
}

export default Separator;
