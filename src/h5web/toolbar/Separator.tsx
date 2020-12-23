import type { ReactElement } from 'react';

import styles from './Separator.module.css';

function Separator(): ReactElement {
  return <span className={styles.sep} />;
}

export default Separator;
