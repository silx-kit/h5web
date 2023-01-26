import { FiArrowRight } from 'react-icons/fi';

import styles from '../explorer/Explorer.module.css';

interface Props {
  path: string;
  isSelected: boolean;
  onClick: () => void;
}

function SearchEntry(props: Props) {
  const { path, isSelected, onClick } = props;

  return (
    <li key={path} className={styles.entity} role="none">
      <button
        className={styles.btn}
        type="button"
        role="treeitem"
        data-path={path}
        onClick={onClick}
        aria-selected={isSelected}
        title={path}
      >
        <FiArrowRight className={styles.icon} />
        <span className={styles.name}>{path}</span>
      </button>
    </li>
  );
}

export default SearchEntry;
