import { Suspense } from 'react';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';

import { useDataContext } from '../providers/DataProvider';
import EntityList from './EntityList';
import styles from './Explorer.module.css';

interface Props {
  selectedPath: string;
  onSelect: (path: string) => void;
}

function Explorer(props: Props) {
  const { selectedPath, onSelect } = props;
  const { filename } = useDataContext();

  return (
    <div className={styles.explorer} role="tree">
      <button
        className={styles.fileBtn}
        type="button"
        role="treeitem"
        aria-selected={selectedPath === '/'}
        onClick={() => onSelect('/')}
      >
        <FiFileText className={styles.fileIcon} />
        <span className={styles.name}>{filename}</span>
      </button>

      <Suspense
        fallback={
          <FiRefreshCw
            className={styles.spinner}
            aria-label="Loading root metadata..."
            data-testid="LoadingExplorerRoot"
          />
        }
      >
        <EntityList
          level={0}
          parentPath="/"
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      </Suspense>
    </div>
  );
}

export default Explorer;
