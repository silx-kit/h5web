import { Suspense, useEffect, useRef } from 'react';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';

import { useDataContext } from '../providers/DataProvider';
import EntityList from './EntityList';
import styles from './Explorer.module.css';
import { useKeyboardSupport } from './hooks';

interface Props {
  selectedPath: string;
  onSelect: (path: string) => void;
}

function Explorer(props: Props) {
  const { selectedPath, onSelect } = props;
  const { filename } = useDataContext();

  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useKeyboardSupport(ref);

  useEffect(() => {
    btnRef.current?.focus();
  }, [btnRef]);

  return (
    <div ref={ref} className={styles.explorer} role="tree">
      <button
        ref={btnRef}
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
