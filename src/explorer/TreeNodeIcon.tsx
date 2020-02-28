import React from 'react';
import { FiGrid, FiChevronRight, FiChevronDown } from 'react-icons/fi';

import styles from './TreeNodeIcon.module.css';

interface Props {
  isBranch: boolean;
  isExpanded?: boolean;
}

function TreeNodeIcon(props: Props): JSX.Element {
  const { isBranch, isExpanded } = props;

  if (!isBranch) {
    return <FiGrid className={styles.icon} />;
  }

  return isExpanded ? (
    <FiChevronDown className={styles.icon} />
  ) : (
    <FiChevronRight className={styles.icon} />
  );
}

export default TreeNodeIcon;
