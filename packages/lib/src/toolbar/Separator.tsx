import { type HTMLAttributes } from 'react';

import styles from './Toolbar.module.css';

function Separator(props: HTMLAttributes<HTMLSpanElement>) {
  const { className, ...otherProps } = props;
  return <span className={`${styles.sep} ${className}`} {...otherProps} />;
}

export default Separator;
